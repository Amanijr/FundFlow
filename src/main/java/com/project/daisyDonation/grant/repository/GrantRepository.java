package com.project.daisyDonation.grant.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.grant.entity.Grant;
import com.project.daisyDonation.grant.entity.GrantStatus;

@Repository
public interface GrantRepository extends JpaRepository<Grant, Long> {

    List<Grant> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<Grant> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    List<Grant> findByProgramIdAndOrganizationIdAndDeletedFalse(Long programId, Long organizationId);

    List<Grant> findByOrganizationIdAndStatusAndDeletedFalse(Long organizationId, GrantStatus status);

    boolean existsByOrganizationIdAndGrantCodeAndDeletedFalse(Long organizationId, String grantCode);
}
