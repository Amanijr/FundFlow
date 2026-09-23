package com.project.daisyDonation.church.service;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.church.dto.MemberDetailResponse;
import com.project.daisyDonation.church.dto.MemberRequest;
import com.project.daisyDonation.church.dto.MemberResponse;
import com.project.daisyDonation.church.entity.Member;
import com.project.daisyDonation.church.repository.MemberRepository;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.common.service.VerticalAccess;
import com.project.daisyDonation.donation.repository.DonationRepository;
import com.project.daisyDonation.donation.service.DonationMapper;
import com.project.daisyDonation.donor.entity.MembershipStatus;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final DonationRepository donationRepository;
    private final TenantSupport tenantSupport;

    @Transactional
    public MemberResponse create(UserPrincipal principal, MemberRequest request) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);
        String email = blankToNull(request.getEmail());
        String phone = blankToNull(request.getPhone());
        validateEmailFormat(email);
        validateUniqueContact(organization.getId(), email, phone, null);

        Member member = new Member();
        member.setOrganization(organization);
        applyRequest(member, request);
        member.setMemberNumber(resolveMemberNumber(organization.getId(), request.getMemberNumber(), null));
        return toResponse(memberRepository.save(member));
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> list(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);
        return memberRepository.findByOrganizationIdAndDeletedFalse(organization.getId()).stream()
                .sorted(Comparator.comparing(Member::getLastName).thenComparing(Member::getFirstName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MemberDetailResponse getById(UserPrincipal principal, Long memberId) {
        Member member = requireMember(principal, memberId);
        Long organizationId = member.getOrganization().getId();

        var donations = donationRepository.findByMemberIdAndOrganizationIdAndDeletedFalse(memberId, organizationId)
                .stream()
                .sorted(Comparator.comparing(
                        d -> d.getDonationTime() != null ? d.getDonationTime() : d.getCreatedAt(),
                        Comparator.reverseOrder()))
                .limit(10)
                .map(DonationMapper::toSummary)
                .toList();

        MemberResponse base = toResponse(member);
        return MemberDetailResponse.builder()
                .id(base.getId())
                .organizationId(base.getOrganizationId())
                .memberNumber(base.getMemberNumber())
                .firstName(base.getFirstName())
                .lastName(base.getLastName())
                .email(base.getEmail())
                .phone(base.getPhone())
                .address(base.getAddress())
                .city(base.getCity())
                .state(base.getState())
                .country(base.getCountry())
                .membershipStatus(base.getMembershipStatus())
                .joinedAt(base.getJoinedAt())
                .notes(base.getNotes())
                .createdAt(base.getCreatedAt())
                .lifetimeValue(donationRepository.sumCompletedAmountByMember(memberId, organizationId))
                .donationCount(donationRepository.countCompletedByMember(memberId, organizationId))
                .recentDonations(donations)
                .build();
    }

    @Transactional
    public MemberResponse update(UserPrincipal principal, Long memberId, MemberRequest request) {
        Member member = requireMember(principal, memberId);
        String email = blankToNull(request.getEmail());
        String phone = blankToNull(request.getPhone());
        validateEmailFormat(email);
        validateUniqueContact(member.getOrganization().getId(), email, phone, memberId);
        applyRequest(member, request);
        member.setMemberNumber(
                resolveMemberNumber(member.getOrganization().getId(), request.getMemberNumber(), memberId));
        return toResponse(memberRepository.save(member));
    }

    @Transactional
    public void delete(UserPrincipal principal, Long memberId) {
        Member member = requireMember(principal, memberId);
        member.setDeleted(true);
        memberRepository.save(member);
    }

    public Member requireMember(UserPrincipal principal, Long memberId) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);
        return memberRepository.findByIdAndOrganizationIdAndDeletedFalse(memberId, organization.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
    }

    private void validateUniqueContact(Long organizationId, String email, String phone, Long excludeMemberId) {
        if (email != null
                && memberRepository.existsByOrganizationIdAndEmailAndDeletedFalse(organizationId, email)
                && !isSameMemberEmail(organizationId, email, excludeMemberId)) {
            throw new ConflictException("A member with this email already exists in the organization");
        }
        if (phone != null
                && memberRepository.existsByOrganizationIdAndPhoneAndDeletedFalse(organizationId, phone)
                && !isSameMemberPhone(organizationId, phone, excludeMemberId)) {
            throw new ConflictException("A member with this phone already exists in the organization");
        }
    }

    private boolean isSameMemberEmail(Long organizationId, String email, Long memberId) {
        if (memberId == null || email == null) {
            return false;
        }
        return memberRepository.findByIdAndOrganizationIdAndDeletedFalse(memberId, organizationId)
                .map(d -> d.getEmail() != null && d.getEmail().equalsIgnoreCase(email))
                .orElse(false);
    }

    private boolean isSameMemberPhone(Long organizationId, String phone, Long memberId) {
        if (memberId == null || phone == null) {
            return false;
        }
        return memberRepository.findByIdAndOrganizationIdAndDeletedFalse(memberId, organizationId)
                .map(d -> Objects.equals(d.getPhone(), phone))
                .orElse(false);
    }

    private void applyRequest(Member member, MemberRequest request) {
        if (request.getFirstName() == null || request.getFirstName().isBlank()) {
            throw new BadRequestException("First name is required");
        }
        member.setFirstName(request.getFirstName().trim());
        member.setLastName(request.getLastName().trim());
        member.setEmail(blankToNull(request.getEmail()));
        member.setPhone(blankToNull(request.getPhone()));
        member.setAddress(blankToNull(request.getAddress()));
        member.setCity(blankToNull(request.getCity()));
        member.setState(blankToNull(request.getState()));
        member.setCountry(blankToNull(request.getCountry()));
        member.setMembershipStatus(
                request.getMembershipStatus() != null ? request.getMembershipStatus() : MembershipStatus.ACTIVE);
        member.setJoinedAt(request.getJoinedAt());
        member.setNotes(blankToNull(request.getNotes()));
    }

    private String resolveMemberNumber(Long organizationId, String requested, Long excludeMemberId) {
        String code = normalizeMemberNumber(requested);
        if (code == null && excludeMemberId != null) {
            return memberRepository
                    .findByIdAndOrganizationIdAndDeletedFalse(excludeMemberId, organizationId)
                    .map(Member::getMemberNumber)
                    .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
        }
        if (code == null) {
            return nextMemberNumber(organizationId);
        }
        if (!code.matches("[A-Z0-9][A-Z0-9\\-]{0,31}")) {
            throw new BadRequestException("Member number can use letters, numbers, and hyphens");
        }
        if (memberRepository.existsByOrganizationIdAndMemberNumberIgnoreCaseAndDeletedFalse(organizationId, code)
                && !isSameMemberNumber(organizationId, code, excludeMemberId)) {
            throw new ConflictException("That member number is already in use");
        }
        return code;
    }

    private String nextMemberNumber(Long organizationId) {
        long next = memberRepository.countByOrganizationId(organizationId) + 1;
        String generated;
        do {
            generated = String.format("M-%04d", next++);
        } while (memberRepository.existsByOrganizationIdAndMemberNumberIgnoreCaseAndDeletedFalse(
                organizationId, generated));
        return generated;
    }

    private boolean isSameMemberNumber(Long organizationId, String code, Long memberId) {
        if (memberId == null) {
            return false;
        }
        return memberRepository
                .findByIdAndOrganizationIdAndDeletedFalse(memberId, organizationId)
                .map(member -> member.getMemberNumber() != null && member.getMemberNumber().equalsIgnoreCase(code))
                .orElse(false);
    }

    private static String normalizeMemberNumber(String value) {
        String trimmed = blankToNull(value);
        return trimmed == null ? null : trimmed.toUpperCase();
    }

    private void validateEmailFormat(String email) {
        if (email == null) {
            return;
        }
        if (!email.contains("@") || email.startsWith("@") || email.endsWith("@")) {
            throw new BadRequestException("Enter a valid email");
        }
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private MemberResponse toResponse(Member member) {
        return MemberResponse.builder()
                .id(member.getId())
                .organizationId(member.getOrganization().getId())
                .memberNumber(member.getMemberNumber())
                .firstName(member.getFirstName())
                .lastName(member.getLastName())
                .email(member.getEmail())
                .phone(member.getPhone())
                .address(member.getAddress())
                .city(member.getCity())
                .state(member.getState())
                .country(member.getCountry())
                .membershipStatus(member.getMembershipStatus() != null
                        ? member.getMembershipStatus()
                        : MembershipStatus.ACTIVE)
                .joinedAt(member.getJoinedAt())
                .notes(member.getNotes())
                .createdAt(member.getCreatedAt())
                .build();
    }
}
