package com.project.daisyDonation.church.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.church.entity.Ministry;

@Repository
public interface MinistryRepository extends JpaRepository<Ministry, Long> {

    List<Ministry> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<Ministry> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    boolean existsByOrganizationIdAndCodeAndDeletedFalse(Long organizationId, String code);
}
