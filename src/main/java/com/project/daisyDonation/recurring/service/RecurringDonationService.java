package com.project.daisyDonation.recurring.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.donor.entity.Donor;
import com.project.daisyDonation.campaign.entity.Campaign;
import com.project.daisyDonation.campaign.service.CampaignService;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.donor.service.DonorService;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.recurring.dto.RecurringDonationRequest;
import com.project.daisyDonation.recurring.dto.RecurringDonationResponse;
import com.project.daisyDonation.recurring.entity.RecurringDonation;
import com.project.daisyDonation.recurring.repository.RecurringDonationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecurringDonationService {

    private final RecurringDonationRepository recurringDonationRepository;
    private final TenantSupport tenantSupport;
    private final DonorService donorService;
    private final CampaignService campaignService;

    @Transactional
    public RecurringDonationResponse create(UserPrincipal principal, RecurringDonationRequest request) {
        Organization organization = tenantSupport.organization(principal);
        Donor donor = donorService.requireDonor(principal, request.getDonorId());

        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }

        RecurringDonation recurring = new RecurringDonation();
        recurring.setOrganization(organization);
        recurring.setDonor(donor);
        recurring.setAmount(request.getAmount());
        recurring.setFrequency(request.getFrequency());
        recurring.setStartDate(request.getStartDate());
        recurring.setEndDate(request.getEndDate());
        recurring.setActive(request.isActive());
        recurring.setNotes(request.getNotes());

        if (request.getCampaignId() != null) {
            Campaign campaign = campaignService.requireCampaign(principal, request.getCampaignId());
            recurring.setCampaign(campaign);
        }

        return toResponse(recurringDonationRepository.save(recurring));
    }

    @Transactional(readOnly = true)
    public java.util.List<RecurringDonationResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return recurringDonationRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RecurringDonationResponse getById(UserPrincipal principal, Long recurringId) {
        return toResponse(requireRecurring(principal, recurringId));
    }

    public RecurringDonation requireRecurring(UserPrincipal principal, Long recurringId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return recurringDonationRepository.findByIdAndOrganizationIdAndDeletedFalse(recurringId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Recurring donation not found"));
    }

    private RecurringDonationResponse toResponse(RecurringDonation recurring) {
        return RecurringDonationResponse.builder()
                .id(recurring.getId())
                .organizationId(recurring.getOrganization().getId())
                .donorId(recurring.getDonor().getId())
                .donorName(recurring.getDonor().getFirstName() + " " + recurring.getDonor().getLastName())
                .campaignId(recurring.getCampaign() != null ? recurring.getCampaign().getId() : null)
                .campaignName(recurring.getCampaign() != null ? recurring.getCampaign().getName() : null)
                .amount(recurring.getAmount())
                .frequency(recurring.getFrequency())
                .startDate(recurring.getStartDate())
                .endDate(recurring.getEndDate())
                .active(recurring.isActive())
                .notes(recurring.getNotes())
                .createdAt(recurring.getCreatedAt())
                .build();
    }
}
