package com.project.daisyDonation.donation.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.donation.entity.DonationStatus;
import com.project.daisyDonation.donation.entity.DonationType;
import com.project.daisyDonation.accounting.service.AccountingPostingService;
import com.project.daisyDonation.campaign.entity.Campaign;
import com.project.daisyDonation.campaign.service.CampaignService;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.donation.dto.DonationCreateRequest;
import com.project.daisyDonation.donation.dto.DonationDetailResponse;
import com.project.daisyDonation.donation.dto.DonationSummaryResponse;
import com.project.daisyDonation.donor.service.DonorService;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.pledge.entity.Pledge;
import com.project.daisyDonation.pledge.entity.PledgeStatus;
import com.project.daisyDonation.pledge.service.PledgeService;
import com.project.daisyDonation.recurring.entity.RecurringDonation;
import com.project.daisyDonation.recurring.service.RecurringDonationService;
import com.project.daisyDonation.donation.repository.DonationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DonationService {

    private final DonationRepository donationRepository;
    private final TenantSupport tenantSupport;
    private final DonorService donorService;
    private final CampaignService campaignService;
    private final PledgeService pledgeService;
    private final RecurringDonationService recurringDonationService;
    private final AccountingPostingService accountingPostingService;

    @Transactional
    public DonationDetailResponse create(UserPrincipal principal, DonationCreateRequest request) {
        Organization organization = tenantSupport.organization(principal);
        validateCreateRequest(request);

        Donation donation = new Donation();
        donation.setOrganization(organization);
        donation.setAmount(request.getAmount());
        donation.setDonationType(request.getDonationType());
        donation.setAnonymous(request.isAnonymous());
        donation.setSource(request.getSource());
        donation.setNotes(request.getNotes());
        donation.setItemDescription(request.getItemDescription());
        donation.setEstimatedValue(request.getEstimatedValue());
        donation.setDonationTime(LocalDateTime.now());

        if (!request.isAnonymous()) {
            if (request.getDonorId() == null) {
                throw new BadRequestException("Donor is required for non-anonymous donations");
            }
            donation.setDonor(donorService.requireDonor(principal, request.getDonorId()));
        }

        if (request.getCampaignId() != null) {
            Campaign campaign = campaignService.requireCampaign(principal, request.getCampaignId());
            donation.setCampaign(campaign);
        }

        if (request.getPledgeId() != null) {
            Pledge pledge = pledgeService.requirePledge(principal, request.getPledgeId());
            donation.setPledge(pledge);
            if (!request.isAnonymous() && request.getDonorId() == null) {
                donation.setDonor(pledge.getDonor());
            }
        }

        if (request.isAnonymous()) {
            donation.setDonor(null);
        }

        if (request.getRecurringDonationId() != null) {
            RecurringDonation recurring = recurringDonationService.requireRecurring(principal,
                    request.getRecurringDonationId());
            donation.setRecurringDonation(recurring);
            donation.setDonationType(DonationType.RECURRING);
            if (!request.isAnonymous() && request.getDonorId() == null) {
                donation.setDonor(recurring.getDonor());
            }
            if (request.getCampaignId() == null && recurring.getCampaign() != null) {
                donation.setCampaign(recurring.getCampaign());
            }
        }

        if (request.getDonationType() == DonationType.IN_KIND) {
            donation.setStatus(DonationStatus.COMPLETED);
            if (request.getEstimatedValue() != null) {
                donation.setAmount(request.getEstimatedValue());
            }
        } else {
            donation.setStatus(DonationStatus.PENDING);
        }

        Donation saved = donationRepository.save(donation);
        if (saved.getStatus() == DonationStatus.COMPLETED && saved.getPledge() != null) {
            pledgeService.applyDonationToPledge(saved.getPledge(), saved.getAmount());
        }

        if (saved.getDonationType() == DonationType.IN_KIND && saved.getStatus() == DonationStatus.COMPLETED) {
            accountingPostingService.postInKindDonation(organization, principal.getId(), saved);
        }

        return DonationMapper.toDetail(saved);
    }

    @Transactional(readOnly = true)
    public List<DonationSummaryResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return donationRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(
                        d -> d.getDonationTime() != null ? d.getDonationTime() : d.getCreatedAt(),
                        Comparator.reverseOrder()))
                .map(DonationMapper::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public DonationDetailResponse getById(UserPrincipal principal, Long donationId) {
        return DonationMapper.toDetail(requireDonation(principal, donationId));
    }

    public Donation requireDonation(UserPrincipal principal, Long donationId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return donationRepository.findByIdAndOrganizationIdAndDeletedFalse(donationId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));
    }

    private void validateCreateRequest(DonationCreateRequest request) {
        if (request.isAnonymous() && request.getDonorId() != null) {
            throw new BadRequestException("Anonymous donations cannot include a donor");
        }

        if (request.getDonationType() == DonationType.IN_KIND) {
            if (request.getItemDescription() == null || request.getItemDescription().isBlank()) {
                throw new BadRequestException("Item description is required for in-kind donations");
            }
            if (request.getEstimatedValue() == null || request.getEstimatedValue().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Estimated value is required for in-kind donations");
            }
        }
    }
}
