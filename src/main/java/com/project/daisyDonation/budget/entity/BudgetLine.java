package com.project.daisyDonation.budget.entity;

import java.math.BigDecimal;

import com.project.daisyDonation.common.entity.Abstract;
import com.project.daisyDonation.expense.entity.ExpenseCategory;
import com.project.daisyDonation.fund.entity.Fund;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "budget_line")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BudgetLine extends Abstract {

    @ManyToOne(optional = false)
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ExpenseCategory category;

    @Column(length = 100)
    private String department;

    @ManyToOne
    @JoinColumn(name = "fund_id")
    private Fund fund;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(length = 500)
    private String description;
}
