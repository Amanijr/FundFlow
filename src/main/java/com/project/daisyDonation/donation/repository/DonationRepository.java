package com.project.daisyDonation.donation.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.donation.entity.DonationStatus;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    List<Donation> findByStatusAndOrganizationIdAndDeletedFalse(DonationStatus status, Long organizationId);

    List<Donation> findByDonorIdAndOrganizationIdAndDeletedFalse(Long donorId, Long organizationId);

    Optional<Donation> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    List<Donation> findByOrganizationIdAndDeletedFalse(Long organizationId);

    List<Donation> findByCampaignIdAndOrganizationIdAndDeletedFalse(Long campaignId, Long organizationId);

    @Query("""
            SELECT COALESCE(SUM(d.amount), 0) FROM Donation d
            WHERE d.campaign.id = :campaignId
              AND d.organization.id = :organizationId
              AND d.status = com.project.daisyDonation.donation.entity.DonationStatus.COMPLETED
              AND d.deleted = false
            """)
    BigDecimal sumCompletedAmountByCampaign(
            @Param("campaignId") Long campaignId,
            @Param("organizationId") Long organizationId);

    @Query("""
            SELECT COUNT(d) FROM Donation d
            WHERE d.campaign.id = :campaignId
              AND d.organization.id = :organizationId
              AND d.status = com.project.daisyDonation.donation.entity.DonationStatus.COMPLETED
              AND d.deleted = false
            """)
    long countCompletedByCampaign(
            @Param("campaignId") Long campaignId,
            @Param("organizationId") Long organizationId);

    @Query("""
            SELECT COALESCE(SUM(d.amount), 0) FROM Donation d
            WHERE d.donor.id = :donorId
              AND d.organization.id = :organizationId
              AND d.status = com.project.daisyDonation.donation.entity.DonationStatus.COMPLETED
              AND d.deleted = false
            """)
    BigDecimal sumCompletedAmountByDonor(
            @Param("donorId") Long donorId,
            @Param("organizationId") Long organizationId);

    @Query("""
            SELECT COUNT(d) FROM Donation d
            WHERE d.donor.id = :donorId
              AND d.organization.id = :organizationId
              AND d.status = com.project.daisyDonation.donation.entity.DonationStatus.COMPLETED
              AND d.deleted = false
            """)
    long countCompletedByDonor(
            @Param("donorId") Long donorId,
            @Param("organizationId") Long organizationId);

    @Query("""
            SELECT d FROM Donation d
            WHERE d.organization.id = :organizationId
              AND d.status = com.project.daisyDonation.donation.entity.DonationStatus.COMPLETED
              AND d.deleted = false
              AND d.donationTime >= :fromDateTime
              AND d.donationTime <= :toDateTime
            ORDER BY d.donationTime ASC
            """)
    List<Donation> findCompletedInPeriod(
            @Param("organizationId") Long organizationId,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime);

    @Query("""
            SELECT COALESCE(SUM(d.amount), 0) FROM Donation d
            WHERE d.organization.id = :organizationId
              AND d.status = com.project.daisyDonation.donation.entity.DonationStatus.COMPLETED
              AND d.deleted = false
              AND d.donationTime >= :fromDateTime
              AND d.donationTime <= :toDateTime
            """)
    BigDecimal sumCompletedAmountInPeriod(
            @Param("organizationId") Long organizationId,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime);

    @Query("""
            SELECT COUNT(DISTINCT d.donor.id) FROM Donation d
            WHERE d.organization.id = :organizationId
              AND d.status = com.project.daisyDonation.donation.entity.DonationStatus.COMPLETED
              AND d.deleted = false
              AND d.donor IS NOT NULL
              AND d.donationTime >= :fromDateTime
              AND d.donationTime <= :toDateTime
            """)
    long countDistinctDonorsInPeriod(
            @Param("organizationId") Long organizationId,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime);
}
