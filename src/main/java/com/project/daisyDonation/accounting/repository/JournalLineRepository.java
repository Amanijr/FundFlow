package com.project.daisyDonation.accounting.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.accounting.entity.JournalLine;

@Repository
public interface JournalLineRepository extends JpaRepository<JournalLine, Long> {

    List<JournalLine> findByJournalEntryIdAndDeletedFalse(Long journalEntryId);

    @Query("""
            SELECT jl FROM JournalLine jl
            JOIN jl.journalEntry je
            WHERE jl.account.id = :accountId
              AND je.organization.id = :organizationId
              AND je.deleted = false
              AND jl.deleted = false
              AND (:fromDate IS NULL OR je.entryDate >= :fromDate)
              AND (:toDate IS NULL OR je.entryDate <= :toDate)
            ORDER BY je.entryDate ASC, jl.id ASC
            """)
    List<JournalLine> findLedgerLines(
            @Param("organizationId") Long organizationId,
            @Param("accountId") Long accountId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    @Query("""
            SELECT COALESCE(SUM(jl.debitAmount), 0) FROM JournalLine jl
            JOIN jl.journalEntry je
            WHERE jl.account.id = :accountId
              AND je.organization.id = :organizationId
              AND je.deleted = false
              AND jl.deleted = false
            """)
    BigDecimal sumDebitsByAccount(
            @Param("organizationId") Long organizationId,
            @Param("accountId") Long accountId);

    @Query("""
            SELECT COALESCE(SUM(jl.creditAmount), 0) FROM JournalLine jl
            JOIN jl.journalEntry je
            WHERE jl.account.id = :accountId
              AND je.organization.id = :organizationId
              AND je.deleted = false
              AND jl.deleted = false
            """)
    BigDecimal sumCreditsByAccount(
            @Param("organizationId") Long organizationId,
            @Param("accountId") Long accountId);

    @Query("""
            SELECT jl.account.id AS accountId,
                   jl.account.code AS accountCode,
                   jl.account.name AS accountName,
                   jl.account.accountType AS accountType,
                   COALESCE(SUM(jl.debitAmount), 0) AS totalDebits,
                   COALESCE(SUM(jl.creditAmount), 0) AS totalCredits
            FROM JournalLine jl
            JOIN jl.journalEntry je
            WHERE je.organization.id = :organizationId
              AND je.deleted = false
              AND jl.deleted = false
              AND (:fromDate IS NULL OR je.entryDate >= :fromDate)
              AND (:toDate IS NULL OR je.entryDate <= :toDate)
              AND (:fundId IS NULL OR jl.fund.id = :fundId)
            GROUP BY jl.account.id, jl.account.code, jl.account.name, jl.account.accountType
            ORDER BY jl.account.code
            """)
    List<AccountPeriodSummary> summarizeByAccount(
            @Param("organizationId") Long organizationId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("fundId") Long fundId);
}
