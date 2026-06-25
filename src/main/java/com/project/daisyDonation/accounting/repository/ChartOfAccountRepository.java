package com.project.daisyDonation.accounting.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.accounting.entity.ChartOfAccount;

@Repository
public interface ChartOfAccountRepository extends JpaRepository<ChartOfAccount, Long> {

    List<ChartOfAccount> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<ChartOfAccount> findByOrganizationIdAndCodeAndDeletedFalse(Long organizationId, String code);

    boolean existsByOrganizationIdAndDeletedFalse(Long organizationId);
}
