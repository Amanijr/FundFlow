package com.project.daisyDonation.fund.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.fund.entity.FundType;

@Repository
public interface FundRepository extends JpaRepository<Fund, Long> {

    List<Fund> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<Fund> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    boolean existsByOrganizationIdAndCodeAndDeletedFalse(Long organizationId, String code);

    List<Fund> findByOrganizationIdAndTypeAndDeletedFalse(Long organizationId, FundType type);
}
