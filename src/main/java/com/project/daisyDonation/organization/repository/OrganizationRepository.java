package com.project.daisyDonation.organization.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.daisyDonation.organization.entity.Organization;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {

    Optional<Organization> findByIdAndDeletedFalse(Long id);

    Optional<Organization> findBySlugAndDeletedFalse(String slug);

    boolean existsBySlugAndDeletedFalse(String slug);

    List<Organization> findByDeletedFalseOrderByNameAsc();

    long countByDeletedFalse();

    long countByActiveTrueAndDeletedFalse();
}
