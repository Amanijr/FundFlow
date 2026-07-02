package com.project.daisyDonation.organization.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.TenantAccess;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.organization.dto.OrganizationRequest;
import com.project.daisyDonation.organization.dto.OrganizationResponse;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.organization.repository.OrganizationRepository;
import com.project.daisyDonation.organization.util.OrganizationSlugs;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Transactional
    public Organization create(OrganizationRequest request) {
        String slug = OrganizationSlugs.resolveUnique(
                organizationRepository, request.getSlug(), request.getName());

        Organization organization = new Organization();
        organization.setName(request.getName());
        organization.setSlug(slug);
        organization.setType(request.getType());
        organization.setEmail(request.getEmail());
        organization.setPhone(request.getPhone());
        organization.setAddress(request.getAddress());
        organization.setCity(request.getCity());
        organization.setState(request.getState());
        organization.setCountry(request.getCountry());
        organization.setActive(true);

        return organizationRepository.save(organization);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getCurrentOrganization(UserPrincipal principal) {
        Long organizationId = resolveOrganizationId(principal);
        Organization organization = organizationRepository.findByIdAndDeletedFalse(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
        return toResponse(organization);
    }

    @Transactional
    public OrganizationResponse updateCurrentOrganization(UserPrincipal principal, OrganizationRequest request) {
        Long organizationId = resolveOrganizationId(principal);
        Organization organization = organizationRepository.findByIdAndDeletedFalse(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));

        if (!organization.getSlug().equals(request.getSlug())
                && request.getSlug() != null
                && !request.getSlug().isBlank()
                && organizationRepository.existsBySlugAndDeletedFalse(request.getSlug())) {
            throw new ConflictException("Organization slug already exists");
        }

        organization.setName(request.getName());
        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            organization.setSlug(request.getSlug());
        }
        organization.setType(request.getType());
        organization.setEmail(request.getEmail());
        organization.setPhone(request.getPhone());
        organization.setAddress(request.getAddress());
        organization.setCity(request.getCity());
        organization.setState(request.getState());
        organization.setCountry(request.getCountry());

        return toResponse(organizationRepository.save(organization));
    }

    public OrganizationResponse toResponse(Organization organization) {
        return OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .slug(organization.getSlug())
                .type(organization.getType())
                .email(organization.getEmail())
                .phone(organization.getPhone())
                .address(organization.getAddress())
                .city(organization.getCity())
                .state(organization.getState())
                .country(organization.getCountry())
                .active(organization.isActive())
                .createdAt(organization.getCreatedAt())
                .build();
    }

    private Long resolveOrganizationId(UserPrincipal principal) {
        return TenantAccess.requireOrganizationId(principal);
    }
}
