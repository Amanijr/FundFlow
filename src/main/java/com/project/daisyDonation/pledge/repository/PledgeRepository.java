package com.project.daisyDonation.pledge.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.daisyDonation.pledge.entity.Pledge;
import com.project.daisyDonation.pledge.entity.PledgeStatus;

public interface PledgeRepository extends JpaRepository<Pledge, Long> {

    List<Pledge> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<Pledge> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    List<Pledge> findByDonorIdAndOrganizationIdAndDeletedFalse(Long donorId, Long organizationId);

    List<Pledge> findByOrganizationIdAndStatusAndDeletedFalse(Long organizationId, PledgeStatus status);
}
