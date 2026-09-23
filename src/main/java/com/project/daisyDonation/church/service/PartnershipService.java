package com.project.daisyDonation.church.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.church.dto.PartnershipMonthProgress;
import com.project.daisyDonation.church.dto.PartnershipRequest;
import com.project.daisyDonation.church.dto.PartnershipResponse;
import com.project.daisyDonation.church.entity.Member;
import com.project.daisyDonation.church.entity.Partnership;
import com.project.daisyDonation.church.entity.PartnershipStatus;
import com.project.daisyDonation.church.repository.PartnershipRepository;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.common.service.VerticalAccess;
import com.project.daisyDonation.donation.dto.DonationCreateRequest;
import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.donation.repository.DonationRepository;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.fund.service.FundService;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PartnershipService {

    private final PartnershipRepository partnershipRepository;
    private final DonationRepository donationRepository;
    private final MemberService memberService;
    private final FundService fundService;
    private final TenantSupport tenantSupport;

    @Transactional
    public PartnershipResponse create(UserPrincipal principal, PartnershipRequest request) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);
        validateDates(request);

        Partnership partnership = new Partnership();
        partnership.setOrganization(organization);
        applyRequest(principal, partnership, request);
        return toResponse(partnershipRepository.save(partnership), true);
    }

    @Transactional(readOnly = true)
    public List<PartnershipResponse> list(UserPrincipal principal, Long memberId) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);

        List<Partnership> rows = memberId != null
                ? partnershipRepository.findByMemberIdAndOrganizationIdAndDeletedFalse(memberId, organization.getId())
                : partnershipRepository.findByOrganizationIdAndDeletedFalse(organization.getId());

        return rows.stream()
                .sorted(Comparator.comparing((Partnership p) -> p.getMember().getLastName())
                        .thenComparing(p -> p.getMember().getFirstName())
                        .thenComparing(Partnership::getStartDate))
                .map(row -> toResponse(row, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public PartnershipResponse getById(UserPrincipal principal, Long partnershipId) {
        return toResponse(requirePartnership(principal, partnershipId), true);
    }

    @Transactional
    public PartnershipResponse update(UserPrincipal principal, Long partnershipId, PartnershipRequest request) {
        Partnership partnership = requirePartnership(principal, partnershipId);
        validateDates(request);
        applyRequest(principal, partnership, request);
        return toResponse(partnershipRepository.save(partnership), true);
    }

    public Partnership requirePartnership(UserPrincipal principal, Long partnershipId) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);
        return partnershipRepository.findByIdAndOrganizationIdAndDeletedFalse(partnershipId, organization.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Partnership not found"));
    }

    public void attachToDonation(UserPrincipal principal, Donation donation, DonationCreateRequest request) {
        Organization organization = tenantSupport.organization(principal);
        if (!VerticalAccess.isChurch(organization)) {
            if (request.getPartnershipId() != null) {
                throw new BadRequestException("Partnerships are only for church gifts");
            }
            return;
        }
        if (request.isAnonymous()) {
            if (request.getPartnershipId() != null) {
                throw new BadRequestException("Anonymous gifts cannot be applied to a partnership");
            }
            return;
        }

        Partnership partnership = null;
        LocalDate month = monthOf(donation, request.getPartnershipMonth());
        if (request.getPartnershipId() != null) {
            partnership = requirePartnership(principal, request.getPartnershipId());
            if (partnership.getStatus() != PartnershipStatus.ACTIVE) {
                throw new BadRequestException("Partnership is not active");
            }
        } else if (donation.getMember() != null) {
            List<Partnership> covering = activeCovering(
                    organization.getId(), donation.getMember().getId(), month);
            if (covering.size() == 1) {
                partnership = covering.get(0);
            }
        }
        if (partnership == null) {
            return;
        }
        if (donation.getMember() == null
                || !partnership.getMember().getId().equals(donation.getMember().getId())) {
            throw new BadRequestException("Gift member must match the partnership member");
        }
        if (!covers(partnership, month)) {
            throw new BadRequestException("This partnership does not cover that month");
        }
        donation.setPartnership(partnership);
        donation.setPartnershipMonth(month);
        if (donation.getFund() == null && partnership.getFund() != null) {
            donation.setFund(partnership.getFund());
        }
    }

    private void applyRequest(UserPrincipal principal, Partnership partnership, PartnershipRequest request) {
        Member member = memberService.requireMember(principal, request.getMemberId());
        partnership.setMember(member);
        partnership.setMonthlyAmount(request.getMonthlyAmount());
        partnership.setStartDate(request.getStartDate());
        partnership.setEndDate(request.getEndDate());
        partnership.setStatus(request.getStatus() != null ? request.getStatus() : PartnershipStatus.ACTIVE);
        partnership.setNotes(request.getNotes());
        if (request.getFundId() != null) {
            partnership.setFund(fundService.requireFund(principal, request.getFundId()));
        } else {
            partnership.setFund(null);
        }
    }

    private void validateDates(PartnershipRequest request) {
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }
    }

    private PartnershipResponse toResponse(Partnership partnership, boolean includeMonths) {
        YearMonth now = YearMonth.now();
        LocalDate thisMonth = now.atDay(1);
        BigDecimal monthly = partnership.getMonthlyAmount();
        boolean coversThisMonth = covers(partnership, thisMonth);
        BigDecimal thisMonthExpected = coversThisMonth ? monthly : BigDecimal.ZERO;
        BigDecimal thisMonthReceived = coversThisMonth
                ? nz(donationRepository.sumCompletedByPartnershipAndMonth(partnership.getId(), thisMonth))
                : BigDecimal.ZERO;

        YearMonth yearStart = YearMonth.of(now.getYear(), 1);
        YearMonth cursor = YearMonth.from(partnership.getStartDate());
        if (cursor.isBefore(yearStart)) {
            cursor = yearStart;
        }
        YearMonth yearEnd = now;
        if (partnership.getEndDate() != null && YearMonth.from(partnership.getEndDate()).isBefore(yearEnd)) {
            yearEnd = YearMonth.from(partnership.getEndDate());
        }
        int monthsThisYear = 0;
        if (!cursor.isAfter(yearEnd)) {
            monthsThisYear = (yearEnd.getYear() - cursor.getYear()) * 12 + yearEnd.getMonthValue()
                    - cursor.getMonthValue() + 1;
        }
        BigDecimal thisYearExpected = monthly.multiply(BigDecimal.valueOf(Math.max(monthsThisYear, 0)));
        BigDecimal thisYearReceived = nz(donationRepository.sumCompletedByPartnershipBetweenMonths(
                partnership.getId(), yearStart.atDay(1), yearEnd.atDay(1)));

        List<PartnershipMonthProgress> months = includeMonths ? buildMonths(partnership, now) : null;

        Member member = partnership.getMember();
        Fund fund = partnership.getFund();
        return PartnershipResponse.builder()
                .id(partnership.getId())
                .memberId(member.getId())
                .memberName(member.getFirstName() + " " + member.getLastName())
                .memberNumber(member.getMemberNumber())
                .fundId(fund != null ? fund.getId() : null)
                .fundName(fund != null ? fund.getName() : null)
                .monthlyAmount(monthly)
                .startDate(partnership.getStartDate())
                .endDate(partnership.getEndDate())
                .status(partnership.getStatus())
                .notes(partnership.getNotes())
                .createdAt(partnership.getCreatedAt())
                .thisMonthExpected(thisMonthExpected)
                .thisMonthReceived(thisMonthReceived)
                .thisMonthStatus(monthStatus(thisMonthExpected, thisMonthReceived, coversThisMonth))
                .thisYearExpected(thisYearExpected)
                .thisYearReceived(thisYearReceived)
                .months(months)
                .build();
    }

    private List<PartnershipMonthProgress> buildMonths(Partnership partnership, YearMonth now) {
        List<PartnershipMonthProgress> months = new ArrayList<>();
        YearMonth cursor = YearMonth.from(partnership.getStartDate());
        YearMonth last = now;
        if (partnership.getEndDate() != null && YearMonth.from(partnership.getEndDate()).isBefore(last)) {
            last = YearMonth.from(partnership.getEndDate());
        }
        BigDecimal expected = partnership.getMonthlyAmount();
        while (!cursor.isAfter(last)) {
            LocalDate month = cursor.atDay(1);
            BigDecimal received = nz(donationRepository.sumCompletedByPartnershipAndMonth(partnership.getId(), month));
            months.add(PartnershipMonthProgress.builder()
                    .year(cursor.getYear())
                    .month(cursor.getMonthValue())
                    .yearMonth(cursor.toString())
                    .expected(expected)
                    .received(received)
                    .status(monthStatus(expected, received, true))
                    .build());
            cursor = cursor.plusMonths(1);
        }
        return months;
    }

    private List<Partnership> activeCovering(Long organizationId, Long memberId, LocalDate month) {
        return partnershipRepository
                .findByMemberIdAndOrganizationIdAndStatusAndDeletedFalse(
                        memberId, organizationId, PartnershipStatus.ACTIVE)
                .stream()
                .filter(row -> covers(row, month))
                .toList();
    }

    private static boolean covers(Partnership partnership, LocalDate month) {
        LocalDate start = partnership.getStartDate().withDayOfMonth(1);
        if (month.isBefore(start)) {
            return false;
        }
        if (partnership.getEndDate() == null) {
            return true;
        }
        return !month.isAfter(partnership.getEndDate().withDayOfMonth(1));
    }

    private static LocalDate monthOf(Donation donation, LocalDate requestedMonth) {
        if (requestedMonth != null) {
            return requestedMonth.withDayOfMonth(1);
        }
        LocalDate giftDate = donation.getDonationTime() != null
                ? donation.getDonationTime().toLocalDate()
                : LocalDate.now();
        return giftDate.withDayOfMonth(1);
    }

    private static String monthStatus(BigDecimal expected, BigDecimal received, boolean coversMonth) {
        if (!coversMonth) {
            return "NONE";
        }
        if (received.compareTo(BigDecimal.ZERO) == 0) {
            return "MISSING";
        }
        if (received.compareTo(expected) > 0) {
            return "AHEAD";
        }
        if (received.compareTo(expected) == 0) {
            return "PAID";
        }
        return "PARTIAL";
    }

    private static BigDecimal nz(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
