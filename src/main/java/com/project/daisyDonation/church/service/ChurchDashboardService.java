package com.project.daisyDonation.church.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.church.dto.ChurchDashboardResponse;
import com.project.daisyDonation.church.dto.MembershipReportResponse;
import com.project.daisyDonation.church.entity.AttendanceRecord;
import com.project.daisyDonation.church.repository.AttendanceRecordRepository;
import com.project.daisyDonation.church.repository.MemberRepository;
import com.project.daisyDonation.collection.entity.CollectionSessionStatus;
import com.project.daisyDonation.collection.repository.CollectionSessionRepository;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.common.service.VerticalAccess;
import com.project.daisyDonation.donation.repository.DonationRepository;
import com.project.daisyDonation.donor.entity.MembershipStatus;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.fund.repository.FundRepository;
import com.project.daisyDonation.fund.service.FundBalanceService;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChurchDashboardService {

    private final TenantSupport tenantSupport;
    private final MemberRepository memberRepository;
    private final FundRepository fundRepository;
    private final FundBalanceService fundBalanceService;
    private final DonationRepository donationRepository;
    private final CollectionSessionRepository collectionSessionRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceService attendanceService;

    @Transactional(readOnly = true)
    public ChurchDashboardResponse dashboard(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);
        Long organizationId = organization.getId();
        LocalDate yearStart = LocalDate.now().withDayOfYear(1);

        BigDecimal fundsRemaining = fundRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .map(Fund::getId)
                .map(fundId -> fundBalanceService.calculateBalance(fundId, organizationId))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal givingThisYear = donationRepository.sumCompletedAmountInPeriod(
                organizationId,
                yearStart.atStartOfDay(),
                LocalDateTime.of(LocalDate.now(), LocalTime.MAX));

        AttendanceRecord last = attendanceRecordRepository
                .findFirstByOrganizationIdAndDeletedFalseOrderByServiceDateDescIdDesc(organizationId)
                .orElse(null);

        return ChurchDashboardResponse.builder()
                .memberCount(memberRepository.countByOrganizationIdAndDeletedFalse(organizationId))
                .activeMemberCount(memberRepository.countByOrganizationIdAndMembershipStatusAndDeletedFalse(
                        organizationId, MembershipStatus.ACTIVE))
                .fundsRemaining(fundsRemaining)
                .givingThisYear(givingThisYear)
                .collectionsNeedingAction(collectionSessionRepository.countByOrganizationIdAndStatusInAndDeletedFalse(
                        organizationId,
                        List.of(CollectionSessionStatus.DRAFT, CollectionSessionStatus.COUNTED)))
                .attendanceThisYear(attendanceService.summary(principal, yearStart, LocalDate.now()).getTotalAttendance())
                .lastServiceName(last != null ? last.getEventName() : null)
                .lastServiceDate(last != null ? last.getServiceDate() : null)
                .lastAttendanceCount(last != null ? last.getAttendanceCount() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public MembershipReportResponse membership(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);
        Long organizationId = organization.getId();
        return MembershipReportResponse.builder()
                .total(memberRepository.countByOrganizationIdAndDeletedFalse(organizationId))
                .active(memberRepository.countByOrganizationIdAndMembershipStatusAndDeletedFalse(
                        organizationId, MembershipStatus.ACTIVE))
                .inactive(memberRepository.countByOrganizationIdAndMembershipStatusAndDeletedFalse(
                        organizationId, MembershipStatus.INACTIVE))
                .visitors(memberRepository.countByOrganizationIdAndMembershipStatusAndDeletedFalse(
                        organizationId, MembershipStatus.VISITOR))
                .build();
    }
}
