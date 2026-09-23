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
import com.project.daisyDonation.church.service.MemberService;
import com.project.daisyDonation.church.service.PartnershipService;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.common.service.VerticalAccess;
import com.project.daisyDonation.audit.dto.DomainAuditEventResponse;
import com.project.daisyDonation.audit.service.DomainAuditService;
import com.project.daisyDonation.donation.dto.DonationCreateRequest;
import com.project.daisyDonation.donation.dto.DonationDetailResponse;
import com.project.daisyDonation.donation.dto.DonationSummaryResponse;
import com.project.daisyDonation.donation.dto.DonationVoidRequest;
import com.project.daisyDonation.donor.service.DonorService;
import com.project.daisyDonation.fund.service.FundService;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.payment.entity.Payment;
import com.project.daisyDonation.payment.repository.PaymentRepository;
import com.project.daisyDonation.pledge.entity.Pledge;
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
    private final MemberService memberService;
    private final PartnershipService partnershipService;
    private final CampaignService campaignService;
    private final PledgeService pledgeService;
    private final RecurringDonationService recurringDonationService;
    private final AccountingPostingService accountingPostingService;
    private final FundService fundService;
    private final PaymentRepository paymentRepository;
    private final DomainAuditService domainAuditService;

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
        assignGiver(principal, organization, donation, request);

        if (request.getCampaignId() != null) {
            Campaign campaign = campaignService.requireCampaign(principal, request.getCampaignId());
            donation.setCampaign(campaign);
        }

        if (request.getFundId() != null) {
            donation.setFund(fundService.requireFund(principal, request.getFundId()));
        }

        if (request.getPledgeId() != null) {
            Pledge pledge = pledgeService.requirePledge(principal, request.getPledgeId());
            donation.setPledge(pledge);
            if (!request.isAnonymous() && donation.getDonor() == null && donation.getMember() == null) {
                donation.setDonor(pledge.getDonor());
            }
        }

        if (request.isAnonymous()) {
            donation.setDonor(null);
            donation.setMember(null);
        }

        if (request.getRecurringDonationId() != null) {
            RecurringDonation recurring = recurringDonationService.requireRecurring(principal,
                    request.getRecurringDonationId());
            donation.setRecurringDonation(recurring);
            donation.setDonationType(DonationType.RECURRING);
            if (!request.isAnonymous() && donation.getDonor() == null && donation.getMember() == null) {
                donation.setDonor(recurring.getDonor());
            }
            if (request.getCampaignId() == null && recurring.getCampaign() != null) {
                donation.setCampaign(recurring.getCampaign());
            }
        }

        partnershipService.attachToDonation(principal, donation, request);

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

        return toDetail(saved);
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
        return toDetail(requireDonation(principal, donationId));
    }

    @Transactional
    public DonationDetailResponse cancel(UserPrincipal principal, Long donationId) {
        Donation donation = requireDonation(principal, donationId);
        if (donation.getStatus() != DonationStatus.PENDING && donation.getStatus() != DonationStatus.FAILED) {
            throw new BadRequestException("Only pending or failed donations can be cancelled");
        }
        donation.setStatus(DonationStatus.CANCELLED);
        Donation saved = donationRepository.save(donation);
        domainAuditService.record(principal, "DONATION_CANCELLED", "donation", saved.getId(), null);
        return toDetail(saved);
    }

    @Transactional
    public DonationDetailResponse voidCompleted(UserPrincipal principal, Long donationId, DonationVoidRequest request) {
        Donation donation = requireDonation(principal, donationId);
        if (donation.getStatus() != DonationStatus.COMPLETED) {
            throw new BadRequestException("Only completed gifts can be voided");
        }

        Payment payment = paymentRepository
                .findByDonationIdAndOrganizationIdAndDeletedFalse(donation.getId(), donation.getOrganization().getId())
                .orElse(null);

        accountingPostingService.reversePostedGift(
                donation.getOrganization(), principal.getId(), donation, payment, request.getReason());

        if (donation.getPledge() != null) {
            pledgeService.reverseDonationOnPledge(donation.getPledge(), donation.getAmount());
        }

        donation.setStatus(DonationStatus.VOIDED);
        Donation saved = donationRepository.save(donation);
        domainAuditService.record(principal, "DONATION_VOIDED", "donation", saved.getId(), request.getReason());
        return toDetail(saved);
    }

    @Transactional(readOnly = true)
    public List<DomainAuditEventResponse> listAudit(UserPrincipal principal, Long donationId) {
        requireDonation(principal, donationId);
        return domainAuditService.listForEntity(principal, "donation", donationId);
    }

    public Donation requireDonation(UserPrincipal principal, Long donationId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return donationRepository.findByIdAndOrganizationIdAndDeletedFalse(donationId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));
    }

    private DonationDetailResponse toDetail(Donation donation) {
        Long paymentId = paymentRepository
                .findByDonationIdAndOrganizationIdAndDeletedFalse(
                        donation.getId(), donation.getOrganization().getId())
                .map(Payment::getId)
                .orElse(null);
        return DonationMapper.toDetail(donation, paymentId);
    }

    private void assignGiver(
            UserPrincipal principal, Organization organization, Donation donation, DonationCreateRequest request) {
        if (request.isAnonymous()) {
            donation.setDonor(null);
            donation.setMember(null);
            return;
        }
        if (VerticalAccess.isChurch(organization)) {
            Long memberId = request.getMemberId() != null ? request.getMemberId() : request.getDonorId();
            if (memberId == null) {
                throw new BadRequestException("Member is required for non-anonymous gifts");
            }
            donation.setMember(memberService.requireMember(principal, memberId));
            donation.setDonor(null);
            return;
        }
        if (request.getDonorId() == null) {
            throw new BadRequestException("Donor is required for non-anonymous donations");
        }
        donation.setDonor(donorService.requireDonor(principal, request.getDonorId()));
    }

    private void validateCreateRequest(DonationCreateRequest request) {
        if (request.isAnonymous() && (request.getDonorId() != null || request.getMemberId() != null)) {
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
