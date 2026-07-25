package com.project.daisyDonation.fund.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.fund.entity.FundTransfer;
import com.project.daisyDonation.fund.entity.FundTransferStatus;

@Repository
public interface FundTransferRepository extends JpaRepository<FundTransfer, Long> {

    List<FundTransfer> findByOrganizationIdAndDeletedFalse(Long organizationId);

    @Query("""
            SELECT COALESCE(SUM(ft.amount), 0) FROM FundTransfer ft
            WHERE ft.toFund.id = :fundId
              AND ft.organization.id = :organizationId
              AND ft.status = com.project.daisyDonation.fund.entity.FundTransferStatus.COMPLETED
              AND ft.deleted = false
            """)
    BigDecimal sumIncomingTransfers(
            @Param("fundId") Long fundId,
            @Param("organizationId") Long organizationId);

    @Query("""
            SELECT COALESCE(SUM(ft.amount), 0) FROM FundTransfer ft
            WHERE ft.fromFund.id = :fundId
              AND ft.organization.id = :organizationId
              AND ft.status = com.project.daisyDonation.fund.entity.FundTransferStatus.COMPLETED
              AND ft.deleted = false
            """)
    BigDecimal sumOutgoingTransfers(
            @Param("fundId") Long fundId,
            @Param("organizationId") Long organizationId);
}
