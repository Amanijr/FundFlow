package com.project.daisyDonation.accounting.repository;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.accounting.entity.FiscalPeriod;
import com.project.daisyDonation.accounting.entity.FiscalPeriodStatus;

@Repository
public interface FiscalPeriodRepository extends JpaRepository<FiscalPeriod, Long> {

    @Query("""
            SELECT fp FROM FiscalPeriod fp
            WHERE fp.organization.id = :organizationId
              AND fp.status = :status
              AND fp.startDate <= :date
              AND fp.endDate >= :date
              AND fp.deleted = false
            """)
    Optional<FiscalPeriod> findOpenPeriodContaining(
            @Param("organizationId") Long organizationId,
            @Param("date") LocalDate date,
            @Param("status") FiscalPeriodStatus status);

    boolean existsByOrganizationIdAndDeletedFalse(Long organizationId);
}
