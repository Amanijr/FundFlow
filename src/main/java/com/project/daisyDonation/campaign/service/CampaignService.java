package com.project.daisyDonation.campaign.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.campaign.dto.CampaignDashboardResponse;
import com.project.daisyDonation.campaign.dto.CampaignRequest;
import com.project.daisyDonation.campaign.dto.CampaignResponse;
import com.project.daisyDonation.campaign.entity.Campaign;
import com.project.daisyDonation.campaign.entity.CampaignStatus;
import com.project.daisyDonation.campaign.repository.CampaignRepository;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.donation.service.DonationMapper;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.donation.repository.DonationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final DonationRepository donationRepository;
    private final TenantSupport tenantSupport;

    @Transactional
    public CampaignResponse create(UserPrincipal principal, CampaignRequest request) {
        Organization organization = tenantSupport.organization(principal);
        Campaign campaign = new Campaign();
        campaign.setOrganization(organization);
        applyRequest(campaign, request);
        if (campaign.getStatus() == null) {
            campaign.setStatus(CampaignStatus.DRAFT);
        }
        return toResponse(campaignRepository.save(campaign));
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return campaignRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(Campaign::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CampaignResponse getById(UserPrincipal principal, Long campaignId) {
        return toResponse(requireCampaign(principal, campaignId));
    }

    @Transactional(readOnly = true)
    public CampaignDashboardResponse getDashboard(UserPrincipal principal, Long campaignId) {
        Campaign campaign = requireCampaign(principal, campaignId);
        Long organizationId = tenantSupport.organizationId(principal);

        BigDecimal raisedAmount = donationRepository.sumCompletedAmountByCampaign(campaignId, organizationId);
        long donationCount = donationRepository.countCompletedByCampaign(campaignId, organizationId);

        BigDecimal targetAmount = campaign.getTargetAmount();
        BigDecimal remainingAmount = targetAmount != null
                ? targetAmount.subtract(raisedAmount).max(BigDecimal.ZERO)
                : null;
        BigDecimal goalPercent = null;
        if (targetAmount != null && targetAmount.compareTo(BigDecimal.ZERO) > 0) {
            goalPercent = raisedAmount
                    .multiply(BigDecimal.valueOf(100))
                    .divide(targetAmount, 2, RoundingMode.HALF_UP);
        }

        var recentDonations = donationRepository
                .findByCampaignIdAndOrganizationIdAndDeletedFalse(campaignId, organizationId)
                .stream()
                .filter(d -> d.getStatus() == com.project.daisyDonation.donation.entity.DonationStatus.COMPLETED)
                .sorted(Comparator.comparing(
                        d -> d.getDonationTime() != null ? d.getDonationTime() : d.getCreatedAt(),
                        Comparator.reverseOrder()))
                .limit(10)
                .map(DonationMapper::toSummary)
                .toList();

        return CampaignDashboardResponse.builder()
                .id(campaign.getId())
                .name(campaign.getName())
                .description(campaign.getDescription())
                .targetAmount(targetAmount)
                .raisedAmount(raisedAmount)
                .remainingAmount(remainingAmount)
                .goalAchievementPercent(goalPercent)
                .donationCount(donationCount)
                .status(campaign.getStatus())
                .startDate(campaign.getStartDate())
                .endDate(campaign.getEndDate())
                .recentDonations(recentDonations)
                .build();
    }

    @Transactional
    public CampaignResponse update(UserPrincipal principal, Long campaignId, CampaignRequest request) {
        Campaign campaign = requireCampaign(principal, campaignId);
        applyRequest(campaign, request);
        return toResponse(campaignRepository.save(campaign));
    }

    @Transactional
    public void delete(UserPrincipal principal, Long campaignId) {
        Campaign campaign = requireCampaign(principal, campaignId);
        campaign.setDeleted(true);
        campaignRepository.save(campaign);
    }

    public Campaign requireCampaign(UserPrincipal principal, Long campaignId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return campaignRepository.findByIdAndOrganizationIdAndDeletedFalse(campaignId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));
    }

    private void applyRequest(Campaign campaign, CampaignRequest request) {
        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Campaign end date cannot be before start date");
        }
        campaign.setName(request.getName());
        campaign.setDescription(request.getDescription());
        campaign.setTargetAmount(request.getTargetAmount());
        campaign.setStartDate(request.getStartDate());
        campaign.setEndDate(request.getEndDate());
        if (request.getStatus() != null) {
            campaign.setStatus(request.getStatus());
        }
    }

    private CampaignResponse toResponse(Campaign campaign) {
        return CampaignResponse.builder()
                .id(campaign.getId())
                .organizationId(campaign.getOrganization().getId())
                .name(campaign.getName())
                .description(campaign.getDescription())
                .targetAmount(campaign.getTargetAmount())
                .startDate(campaign.getStartDate())
                .endDate(campaign.getEndDate())
                .status(campaign.getStatus())
                .createdAt(campaign.getCreatedAt())
                .build();
    }
}
