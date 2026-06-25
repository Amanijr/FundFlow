package com.project.daisyDonation.donor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.donor.entity.Donor;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {

    List<Donor> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<Donor> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    boolean existsByOrganizationIdAndEmailAndDeletedFalse(Long organizationId, String email);

    boolean existsByOrganizationIdAndPhoneAndDeletedFalse(Long organizationId, String phone);
}
