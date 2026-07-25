package com.project.daisyDonation.church.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.church.dto.MinistryRequest;
import com.project.daisyDonation.church.dto.MinistryResponse;
import com.project.daisyDonation.church.entity.Ministry;
import com.project.daisyDonation.church.repository.MinistryRepository;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.common.service.VerticalAccess;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MinistryService {

    private final MinistryRepository ministryRepository;
    private final TenantSupport tenantSupport;

    @Transactional
    public MinistryResponse create(UserPrincipal principal, MinistryRequest request) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);

        if (ministryRepository.existsByOrganizationIdAndCodeAndDeletedFalse(organization.getId(), request.getCode())) {
            throw new ConflictException("Ministry code already exists");
        }

        Ministry ministry = new Ministry();
        ministry.setOrganization(organization);
        applyRequest(ministry, request);
        return toResponse(ministryRepository.save(ministry));
    }

    @Transactional(readOnly = true)
    public List<MinistryResponse> list(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);

        return ministryRepository.findByOrganizationIdAndDeletedFalse(organization.getId()).stream()
                .sorted(Comparator.comparing(Ministry::getName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MinistryResponse getById(UserPrincipal principal, Long ministryId) {
        return toResponse(requireMinistry(principal, ministryId));
    }

    @Transactional
    public MinistryResponse update(UserPrincipal principal, Long ministryId, MinistryRequest request) {
        Ministry ministry = requireMinistry(principal, ministryId);

        if (!ministry.getCode().equals(request.getCode())
                && ministryRepository.existsByOrganizationIdAndCodeAndDeletedFalse(
                        ministry.getOrganization().getId(), request.getCode())) {
            throw new ConflictException("Ministry code already exists");
        }

        applyRequest(ministry, request);
        return toResponse(ministryRepository.save(ministry));
    }

    public Ministry requireMinistry(UserPrincipal principal, Long ministryId) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);
        return ministryRepository.findByIdAndOrganizationIdAndDeletedFalse(ministryId, organization.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Ministry not found"));
    }

    private void applyRequest(Ministry ministry, MinistryRequest request) {
        ministry.setName(request.getName());
        ministry.setCode(request.getCode());
        ministry.setDescription(request.getDescription());
        ministry.setLeaderName(request.getLeaderName());
        ministry.setActive(request.isActive());
    }

    private MinistryResponse toResponse(Ministry ministry) {
        return MinistryResponse.builder()
                .id(ministry.getId())
                .name(ministry.getName())
                .code(ministry.getCode())
                .description(ministry.getDescription())
                .leaderName(ministry.getLeaderName())
                .active(ministry.isActive())
                .createdAt(ministry.getCreatedAt())
                .build();
    }
}
