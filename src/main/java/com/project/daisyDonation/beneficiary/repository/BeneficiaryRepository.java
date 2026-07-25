package com.project.daisyDonation.beneficiary.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.beneficiary.entity.Beneficiary;
import com.project.daisyDonation.beneficiary.entity.BeneficiaryType;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {

    List<Beneficiary> findByOrganizationIdAndDeletedFalse(Long organizationId);

    List<Beneficiary> findByOrganizationIdAndBeneficiaryTypeAndDeletedFalse(
            Long organizationId, BeneficiaryType beneficiaryType);

    Optional<Beneficiary> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    boolean existsByOrganizationIdAndCodeAndDeletedFalse(Long organizationId, String code);

    long countByOrganizationIdAndDeletedFalse(Long organizationId);
}
