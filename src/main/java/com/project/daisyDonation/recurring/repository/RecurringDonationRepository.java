package com.project.daisyDonation.recurring.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.daisyDonation.recurring.entity.RecurringDonation;

public interface RecurringDonationRepository extends JpaRepository<RecurringDonation, Long> {

    List<RecurringDonation> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<RecurringDonation> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    List<RecurringDonation> findByOrganizationIdAndActiveTrueAndDeletedFalse(Long organizationId);
}
