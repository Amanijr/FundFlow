package com.project.daisyDonation.budget.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.budget.entity.BudgetLine;

@Repository
public interface BudgetLineRepository extends JpaRepository<BudgetLine, Long> {

    List<BudgetLine> findByBudgetIdAndDeletedFalse(Long budgetId);

    Optional<BudgetLine> findByIdAndBudgetIdAndDeletedFalse(Long id, Long budgetId);
}
