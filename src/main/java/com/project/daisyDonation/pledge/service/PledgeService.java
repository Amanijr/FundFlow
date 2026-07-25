package com.project.daisyDonation.pledge.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.donor.entity.Donor;
import com.project.daisyDonation.campaign.entity.Campaign;
import com.project.daisyDonation.campaign.service.CampaignService;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.donor.service.DonorService;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.pledge.dto.PledgeRequest;
import com.project.daisyDonation.pledge.dto.PledgeResponse;
import com.project.daisyDonation.pledge.entity.Pledge;
import com.project.daisyDonation.pledge.entity.PledgeStatus;
import com.project.daisyDonation.pledge.repository.PledgeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PledgeService {

    private final PledgeRepository pledgeRepository;
    private final TenantSupport tenantSupport;
    private final DonorService donorService;
    private final CampaignService campaignService;

    @Transactional
    public PledgeResponse create(UserPrincipal principal, PledgeRequest request) {
        Organization organization = tenantSupport.organization(principal);
        Donor donor = donorService.requireDonor(principal, request.getDonorId());

        Pledge pledge = new Pledge();
        pledge.setOrganization(organization);
        pledge.setDonor(donor);
        pledge.setPledgedAmount(request.getPledgedAmount());
        pledge.setFulfilledAmount(BigDecimal.ZERO);
        pledge.setDueDate(request.getDueDate());
        pledge.setNotes(request.getNotes());
        pledge.setStatus(PledgeStatus.OPEN);

        if (request.getCampaignId() != null) {
            Campaign campaign = campaignService.requireCampaign(principal, request.getCampaignId());
            pledge.setCampaign(campaign);
        }

        return toResponse(pledgeRepository.save(pledge));
    }

    @Transactional(readOnly = true)
    public java.util.List<PledgeResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return pledgeRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PledgeResponse getById(UserPrincipal principal, Long pledgeId) {
        return toResponse(requirePledge(principal, pledgeId));
    }

    public Pledge requirePledge(UserPrincipal principal, Long pledgeId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return pledgeRepository.findByIdAndOrganizationIdAndDeletedFalse(pledgeId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Pledge not found"));
    }

    @Transactional
    public void applyDonationToPledge(Pledge pledge, BigDecimal amount) {
        BigDecimal newFulfilled = pledge.getFulfilledAmount().add(amount);
        pledge.setFulfilledAmount(newFulfilled);

        if (newFulfilled.compareTo(pledge.getPledgedAmount()) >= 0) {
            pledge.setStatus(PledgeStatus.FULFILLED);
        } else if (newFulfilled.compareTo(BigDecimal.ZERO) > 0) {
            pledge.setStatus(PledgeStatus.PARTIALLY_FULFILLED);
        }

        pledgeRepository.save(pledge);
    }

    private PledgeResponse toResponse(Pledge pledge) {
        BigDecimal remaining = pledge.getPledgedAmount().subtract(pledge.getFulfilledAmount()).max(BigDecimal.ZERO);
        return PledgeResponse.builder()
                .id(pledge.getId())
                .organizationId(pledge.getOrganization().getId())
                .donorId(pledge.getDonor().getId())
                .donorName(pledge.getDonor().getFirstName() + " " + pledge.getDonor().getLastName())
                .pledgedAmount(pledge.getPledgedAmount())
                .fulfilledAmount(pledge.getFulfilledAmount())
                .remainingAmount(remaining)
                .dueDate(pledge.getDueDate())
                .status(pledge.getStatus())
                .notes(pledge.getNotes())
                .createdAt(pledge.getCreatedAt())
                .build();
    }
}
