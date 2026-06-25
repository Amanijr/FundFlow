package com.project.daisyDonation.common.service;

import org.springframework.stereotype.Service;

import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.TenantAccess;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.organization.repository.OrganizationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TenantSupport {

    private final OrganizationRepository organizationRepository;

    public Long organizationId(UserPrincipal principal) {
        return TenantAccess.requireOrganizationId(principal);
    }

    public Organization organization(UserPrincipal principal) {
        Long organizationId = organizationId(principal);
        return organizationRepository.findByIdAndDeletedFalse(organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization not found"));
    }
}
