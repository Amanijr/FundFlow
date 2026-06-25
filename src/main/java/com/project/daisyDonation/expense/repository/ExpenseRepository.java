package com.project.daisyDonation.expense.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.expense.entity.Expense;
import com.project.daisyDonation.expense.entity.ExpenseCategory;
import com.project.daisyDonation.expense.entity.ExpenseStatus;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<Expense> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    List<Expense> findByOrganizationIdAndStatusAndDeletedFalse(Long organizationId, ExpenseStatus status);

    List<Expense> findByFundIdAndOrganizationIdAndDeletedFalse(Long fundId, Long organizationId);

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0) FROM Expense e
            WHERE e.fund.id = :fundId
              AND e.organization.id = :organizationId
              AND e.status IN (
                com.project.daisyDonation.expense.entity.ExpenseStatus.PAID,
                com.project.daisyDonation.expense.entity.ExpenseStatus.RECONCILED)
              AND e.deleted = false
            """)
    BigDecimal sumPaidAmountByFund(
            @Param("fundId") Long fundId,
            @Param("organizationId") Long organizationId);

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0) FROM Expense e
            WHERE e.organization.id = :organizationId
              AND e.category = :category
              AND e.status IN (
                com.project.daisyDonation.expense.entity.ExpenseStatus.PAID,
                com.project.daisyDonation.expense.entity.ExpenseStatus.RECONCILED)
              AND e.deleted = false
            """)
    BigDecimal sumPaidAmountByCategory(
            @Param("organizationId") Long organizationId,
            @Param("category") ExpenseCategory category);

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0) FROM Expense e
            WHERE e.grant.id = :grantId
              AND e.organization.id = :organizationId
              AND e.status IN (
                com.project.daisyDonation.expense.entity.ExpenseStatus.PAID,
                com.project.daisyDonation.expense.entity.ExpenseStatus.RECONCILED)
              AND e.deleted = false
            """)
    BigDecimal sumPaidAmountByGrant(
            @Param("grantId") Long grantId,
            @Param("organizationId") Long organizationId);

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0) FROM Expense e
            WHERE e.program.id = :programId
              AND e.organization.id = :organizationId
              AND e.status IN (
                com.project.daisyDonation.expense.entity.ExpenseStatus.PAID,
                com.project.daisyDonation.expense.entity.ExpenseStatus.RECONCILED)
              AND e.deleted = false
            """)
    BigDecimal sumPaidAmountByProgram(
            @Param("programId") Long programId,
            @Param("organizationId") Long organizationId);

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0) FROM Expense e
            WHERE e.organization.id = :organizationId
              AND e.status IN (
                com.project.daisyDonation.expense.entity.ExpenseStatus.PAID,
                com.project.daisyDonation.expense.entity.ExpenseStatus.RECONCILED)
              AND e.deleted = false
            """)
    BigDecimal sumTotalPaidAmount(@Param("organizationId") Long organizationId);

    @Query("""
            SELECT COUNT(e) FROM Expense e
            WHERE e.organization.id = :organizationId
              AND e.status = :status
              AND e.deleted = false
            """)
    long countByStatus(
            @Param("organizationId") Long organizationId,
            @Param("status") ExpenseStatus status);

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0) FROM Expense e
            WHERE e.organization.id = :organizationId
              AND e.category = :category
              AND e.status IN (
                com.project.daisyDonation.expense.entity.ExpenseStatus.PAID,
                com.project.daisyDonation.expense.entity.ExpenseStatus.RECONCILED)
              AND e.deleted = false
              AND (:department IS NULL OR e.department = :department)
              AND (:fundId IS NULL OR e.fund.id = :fundId)
              AND (:programId IS NULL OR e.program.id = :programId)
              AND (:grantId IS NULL OR e.grant.id = :grantId)
              AND e.paidAt >= :fromDateTime
              AND e.paidAt <= :toDateTime
            """)
    BigDecimal sumPaidAmountInPeriod(
            @Param("organizationId") Long organizationId,
            @Param("category") ExpenseCategory category,
            @Param("department") String department,
            @Param("fundId") Long fundId,
            @Param("programId") Long programId,
            @Param("grantId") Long grantId,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime);

    @Query("""
            SELECT COALESCE(SUM(e.amount), 0) FROM Expense e
            WHERE e.organization.id = :organizationId
              AND e.status IN (
                com.project.daisyDonation.expense.entity.ExpenseStatus.PAID,
                com.project.daisyDonation.expense.entity.ExpenseStatus.RECONCILED)
              AND e.deleted = false
              AND e.paidAt >= :fromDateTime
              AND e.paidAt <= :toDateTime
            """)
    BigDecimal sumPaidAmountInPeriod(
            @Param("organizationId") Long organizationId,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime);

    @Query("""
            SELECT e FROM Expense e
            WHERE e.organization.id = :organizationId
              AND e.status IN (
                com.project.daisyDonation.expense.entity.ExpenseStatus.PAID,
                com.project.daisyDonation.expense.entity.ExpenseStatus.RECONCILED)
              AND e.deleted = false
              AND e.paidAt >= :fromDateTime
              AND e.paidAt <= :toDateTime
            ORDER BY e.paidAt ASC
            """)
    List<Expense> findPaidInPeriod(
            @Param("organizationId") Long organizationId,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime);
}
