package com.project.daisyDonation.collection.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.payment.entity.Payment;
import com.project.daisyDonation.donation.entity.DonationStatus;
import com.project.daisyDonation.donation.entity.DonationType;
import com.project.daisyDonation.accounting.service.AccountingPostingService;
import com.project.daisyDonation.campaign.entity.Campaign;
import com.project.daisyDonation.campaign.service.CampaignService;
import com.project.daisyDonation.collection.dto.CollectionDashboardResponse;
import com.project.daisyDonation.collection.dto.CollectionSessionCountRequest;
import com.project.daisyDonation.collection.dto.CollectionSessionCreateRequest;
import com.project.daisyDonation.collection.dto.CollectionSessionResponse;
import com.project.daisyDonation.collection.dto.CollectionTypeSummary;
import com.project.daisyDonation.collection.entity.CollectionSession;
import com.project.daisyDonation.collection.entity.CollectionSessionStatus;
import com.project.daisyDonation.collection.entity.CollectionType;
import com.project.daisyDonation.collection.repository.CollectionSessionRepository;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.payment.entity.PaymentChannel;
import com.project.daisyDonation.donation.repository.DonationRepository;
import com.project.daisyDonation.payment.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CollectionSessionService {

    private final CollectionSessionRepository collectionSessionRepository;
    private final DonationRepository donationRepository;
    private final PaymentRepository paymentRepository;
    private final TenantSupport tenantSupport;
    private final CampaignService campaignService;
    private final AccountingPostingService accountingPostingService;

    @Transactional
    public CollectionSessionResponse create(UserPrincipal principal, CollectionSessionCreateRequest request) {
        Organization organization = tenantSupport.organization(principal);

        CollectionSession session = new CollectionSession();
        session.setOrganization(organization);
        session.setCollectionType(request.getCollectionType());
        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setLocation(request.getLocation());
        session.setNotes(request.getNotes());
        session.setStatus(CollectionSessionStatus.DRAFT);
        session.setCollectedByUserId(principal.getId());

        if (request.getCampaignId() != null) {
            Campaign campaign = campaignService.requireCampaign(principal, request.getCampaignId());
            session.setCampaign(campaign);
        }

        return toResponse(collectionSessionRepository.save(session));
    }

    @Transactional
    public CollectionSessionResponse submitCount(
            UserPrincipal principal, Long sessionId, CollectionSessionCountRequest request) {
        CollectionSession session = requireSession(principal, sessionId);

        if (session.getStatus() != CollectionSessionStatus.DRAFT) {
            throw new BadRequestException("Only draft sessions can be counted");
        }

        session.setTotalAmount(request.getTotalAmount());
        session.setPaymentMethod(request.getPaymentMethod());
        session.setCollectedAt(request.getCollectedAt());
        if (request.getNotes() != null) {
            session.setNotes(request.getNotes());
        }
        session.setCollectedByUserId(principal.getId());
        session.setStatus(CollectionSessionStatus.COUNTED);

        return toResponse(collectionSessionRepository.save(session));
    }

    @Transactional
    public CollectionSessionResponse verify(UserPrincipal principal, Long sessionId) {
        CollectionSession session = requireSession(principal, sessionId);

        if (session.getStatus() != CollectionSessionStatus.COUNTED) {
            throw new BadRequestException("Only counted sessions can be verified");
        }

        if (session.getDonation() != null) {
            throw new BadRequestException("Session already has a linked donation");
        }

        LocalDateTime donationTime = session.getCollectedAt() != null
                ? session.getCollectedAt()
                : LocalDateTime.now();

        Donation donation = new Donation();
        donation.setOrganization(session.getOrganization());
        donation.setAmount(session.getTotalAmount());
        donation.setAnonymous(true);
        donation.setDonationType(DonationType.COLLECTION);
        donation.setCollectionSession(session);
        donation.setCampaign(session.getCampaign());
        donation.setSource(session.getCollectionType().name());
        donation.setStatus(DonationStatus.COMPLETED);
        donation.setDonationTime(donationTime);
        donation.setNotes(session.getNotes());
        donation = donationRepository.save(donation);

        Payment payment = new Payment();
        payment.setOrganization(session.getOrganization());
        payment.setDonation(donation);
        payment.setChannel(PaymentChannel.MANUAL);
        payment.setPaymentMethod(session.getPaymentMethod());
        payment.setTransactionId("MANUAL-COL-" + session.getId());
        payment.setReceiptNumber("COL-" + session.getId());
        payment.setRecordedByUserId(principal.getId());
        payment.setCollectionDate(donationTime);
        payment.setPaymentNotes("Collection session verification");
        payment.setSuccessful(true);
        payment.setProcessedAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        accountingPostingService.postDonationPayment(
                session.getOrganization(), principal.getId(), donation, payment);

        session.setDonation(donation);
        session.setVerifiedByUserId(principal.getId());
        session.setStatus(CollectionSessionStatus.VERIFIED);

        return toResponse(collectionSessionRepository.save(session));
    }

    @Transactional
    public CollectionSessionResponse markDeposited(UserPrincipal principal, Long sessionId) {
        CollectionSession session = requireSession(principal, sessionId);

        if (session.getStatus() != CollectionSessionStatus.VERIFIED) {
            throw new BadRequestException("Only verified sessions can be marked deposited");
        }

        session.setStatus(CollectionSessionStatus.DEPOSITED);
        return toResponse(collectionSessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    public List<CollectionSessionResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return collectionSessionRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(CollectionSession::getCreatedAt).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CollectionSessionResponse getById(UserPrincipal principal, Long sessionId) {
        return toResponse(requireSession(principal, sessionId));
    }

    @Transactional(readOnly = true)
    public CollectionDashboardResponse getDashboard(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);

        List<CollectionTypeSummary> byType = Arrays.stream(CollectionType.values())
                .map(type -> CollectionTypeSummary.builder()
                        .collectionType(type)
                        .totalVerifiedAmount(collectionSessionRepository.sumVerifiedAmountByType(
                                organizationId, type))
                        .verifiedSessionCount(collectionSessionRepository.countVerifiedByType(
                                organizationId, type))
                        .build())
                .filter(summary -> summary.getVerifiedSessionCount() > 0
                        || summary.getTotalVerifiedAmount().compareTo(BigDecimal.ZERO) > 0)
                .toList();

        BigDecimal totalAmount = byType.stream()
                .map(CollectionTypeSummary::getTotalVerifiedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalSessions = byType.stream()
                .mapToLong(CollectionTypeSummary::getVerifiedSessionCount)
                .sum();

        List<CollectionSessionResponse> recentSessions = collectionSessionRepository
                .findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .filter(s -> s.getStatus() == CollectionSessionStatus.VERIFIED
                        || s.getStatus() == CollectionSessionStatus.DEPOSITED)
                .sorted(Comparator.comparing(CollectionSession::getCollectedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(10)
                .map(this::toResponse)
                .toList();

        return CollectionDashboardResponse.builder()
                .totalVerifiedAmount(totalAmount)
                .totalVerifiedSessions(totalSessions)
                .byCollectionType(byType)
                .recentSessions(recentSessions)
                .build();
    }

    public CollectionSession requireSession(UserPrincipal principal, Long sessionId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return collectionSessionRepository.findByIdAndOrganizationIdAndDeletedFalse(sessionId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Collection session not found"));
    }

    private CollectionSessionResponse toResponse(CollectionSession session) {
        return CollectionSessionResponse.builder()
                .id(session.getId())
                .organizationId(session.getOrganization().getId())
                .collectionType(session.getCollectionType())
                .title(session.getTitle())
                .description(session.getDescription())
                .totalAmount(session.getTotalAmount())
                .paymentMethod(session.getPaymentMethod())
                .collectedAt(session.getCollectedAt())
                .location(session.getLocation())
                .collectedByUserId(session.getCollectedByUserId())
                .verifiedByUserId(session.getVerifiedByUserId())
                .status(session.getStatus())
                .campaignId(session.getCampaign() != null ? session.getCampaign().getId() : null)
                .campaignName(session.getCampaign() != null ? session.getCampaign().getName() : null)
                .donationId(session.getDonation() != null ? session.getDonation().getId() : null)
                .notes(session.getNotes())
                .createdAt(session.getCreatedAt())
                .build();
    }
}
