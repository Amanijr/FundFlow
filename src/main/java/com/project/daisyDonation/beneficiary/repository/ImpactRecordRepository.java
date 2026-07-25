package com.project.daisyDonation.beneficiary.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.beneficiary.entity.ImpactRecord;

@Repository
public interface ImpactRecordRepository extends JpaRepository<ImpactRecord, Long> {

    List<ImpactRecord> findByOrganizationIdAndDeletedFalseOrderByRecordedDateDesc(Long organizationId);

    List<ImpactRecord> findByBeneficiaryIdAndOrganizationIdAndDeletedFalseOrderByRecordedDateDesc(
            Long beneficiaryId, Long organizationId);

    Optional<ImpactRecord> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    long countByOrganizationIdAndDeletedFalse(Long organizationId);
}
