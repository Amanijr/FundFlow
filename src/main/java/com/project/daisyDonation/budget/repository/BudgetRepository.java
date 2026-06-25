package com.project.daisyDonation.budget.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.budget.entity.Budget;
import com.project.daisyDonation.budget.entity.BudgetScopeType;
import com.project.daisyDonation.budget.entity.BudgetStatus;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<Budget> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    List<Budget> findByOrganizationIdAndFiscalYearAndStatusAndDeletedFalse(
            Long organizationId, int fiscalYear, BudgetStatus status);

    boolean existsByOrganizationIdAndFiscalYearAndScopeTypeAndStatusAndDeletedFalse(
            Long organizationId, int fiscalYear, BudgetScopeType scopeType, BudgetStatus status);
}
