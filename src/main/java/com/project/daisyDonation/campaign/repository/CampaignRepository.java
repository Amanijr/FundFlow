package com.project.daisyDonation.campaign.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.campaign.entity.Campaign;
import com.project.daisyDonation.campaign.entity.CampaignStatus;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<Campaign> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    List<Campaign> findByOrganizationIdAndStatusAndDeletedFalse(Long organizationId, CampaignStatus status);
}
