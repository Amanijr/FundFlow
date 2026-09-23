package com.project.daisyDonation.church.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.church.entity.Partnership;
import com.project.daisyDonation.church.entity.PartnershipStatus;

@Repository
public interface PartnershipRepository extends JpaRepository<Partnership, Long> {

    List<Partnership> findByOrganizationIdAndDeletedFalse(Long organizationId);

    List<Partnership> findByMemberIdAndOrganizationIdAndDeletedFalse(Long memberId, Long organizationId);

    List<Partnership> findByMemberIdAndOrganizationIdAndStatusAndDeletedFalse(
            Long memberId, Long organizationId, PartnershipStatus status);

    Optional<Partnership> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);
}
