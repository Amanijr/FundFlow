package com.project.daisyDonation.church.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.church.dto.MemberMinistryRequest;
import com.project.daisyDonation.church.dto.MemberMinistryResponse;
import com.project.daisyDonation.church.entity.Member;
import com.project.daisyDonation.church.entity.MemberMinistry;
import com.project.daisyDonation.church.entity.MemberMinistryStatus;
import com.project.daisyDonation.church.entity.Ministry;
import com.project.daisyDonation.church.repository.MemberMinistryRepository;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.common.service.VerticalAccess;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MemberMinistryService {

    private final MemberMinistryRepository memberMinistryRepository;
    private final MinistryService ministryService;
    private final MemberService memberService;
    private final TenantSupport tenantSupport;

    @Transactional
    public MemberMinistryResponse assign(UserPrincipal principal, Long ministryId, MemberMinistryRequest request) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);
        Ministry ministry = ministryService.requireMinistry(principal, ministryId);
        Member member = memberService.requireMember(principal, request.getMemberId());

        return memberMinistryRepository
                .findByOrganizationIdAndMember_IdAndMinistry_IdAndDeletedFalse(
                        organization.getId(), member.getId(), ministry.getId())
                .map(existing -> reactivate(existing, request))
                .orElseGet(() -> createAssignment(organization, member, ministry, request));
    }

    @Transactional(readOnly = true)
    public List<MemberMinistryResponse> listForMinistry(UserPrincipal principal, Long ministryId) {
        Ministry ministry = ministryService.requireMinistry(principal, ministryId);
        return memberMinistryRepository
                .findByMinistry_IdAndOrganizationIdAndDeletedFalse(
                        ministry.getId(), ministry.getOrganization().getId())
                .stream()
                .sorted(Comparator.comparing(
                        assignment -> assignment.getMember().getLastName() + assignment.getMember().getFirstName()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MemberMinistryResponse> listForMember(UserPrincipal principal, Long memberId) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);
        Member member = memberService.requireMember(principal, memberId);
        return memberMinistryRepository
                .findByMember_IdAndOrganizationIdAndDeletedFalse(member.getId(), organization.getId())
                .stream()
                .sorted(Comparator.comparing(assignment -> assignment.getMinistry().getName()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MemberMinistryResponse deactivate(UserPrincipal principal, Long ministryId, Long assignmentId) {
        ministryService.requireMinistry(principal, ministryId);
        Long organizationId = tenantSupport.organizationId(principal);
        MemberMinistry assignment = memberMinistryRepository
                .findByIdAndOrganizationIdAndDeletedFalse(assignmentId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Ministry assignment not found"));
        if (!assignment.getMinistry().getId().equals(ministryId)) {
            throw new BadRequestException("Assignment does not belong to this ministry");
        }
        assignment.setStatus(MemberMinistryStatus.INACTIVE);
        return toResponse(memberMinistryRepository.save(assignment));
    }

    private MemberMinistryResponse reactivate(MemberMinistry existing, MemberMinistryRequest request) {
        if (existing.getStatus() == MemberMinistryStatus.ACTIVE) {
            throw new ConflictException("This member is already in the ministry");
        }
        applyRole(existing, request);
        existing.setStatus(
                request.getStatus() != null ? request.getStatus() : MemberMinistryStatus.ACTIVE);
        if (request.getJoinedAt() != null) {
            existing.setJoinedAt(request.getJoinedAt());
        }
        return toResponse(memberMinistryRepository.save(existing));
    }

    private MemberMinistryResponse createAssignment(
            Organization organization, Member member, Ministry ministry, MemberMinistryRequest request) {
        MemberMinistry assignment = new MemberMinistry();
        assignment.setOrganization(organization);
        assignment.setMember(member);
        assignment.setMinistry(ministry);
        applyRole(assignment, request);
        assignment.setStatus(
                request.getStatus() != null ? request.getStatus() : MemberMinistryStatus.ACTIVE);
        assignment.setJoinedAt(request.getJoinedAt() != null ? request.getJoinedAt() : LocalDate.now());
        return toResponse(memberMinistryRepository.save(assignment));
    }

    private void applyRole(MemberMinistry assignment, MemberMinistryRequest request) {
        if (request.getRole() != null) {
            String role = request.getRole().trim();
            assignment.setRole(role.isEmpty() ? null : role);
        }
    }

    private MemberMinistryResponse toResponse(MemberMinistry assignment) {
        Member member = assignment.getMember();
        Ministry ministry = assignment.getMinistry();
        return MemberMinistryResponse.builder()
                .id(assignment.getId())
                .memberId(member.getId())
                .memberName(member.getFirstName() + " " + member.getLastName())
                .ministryId(ministry.getId())
                .ministryName(ministry.getName())
                .role(assignment.getRole())
                .status(assignment.getStatus())
                .joinedAt(assignment.getJoinedAt())
                .createdAt(assignment.getCreatedAt())
                .build();
    }
}
