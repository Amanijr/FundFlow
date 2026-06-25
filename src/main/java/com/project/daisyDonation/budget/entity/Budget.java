package com.project.daisyDonation.budget.entity;

import java.time.LocalDate;

import com.project.daisyDonation.campaign.entity.Campaign;
import com.project.daisyDonation.common.entity.TenantEntity;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.program.entity.Program;

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
@Table(name = "budget")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Budget extends TenantEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "fiscal_year", nullable = false)
    private int fiscalYear;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private BudgetStatus status = BudgetStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope_type", nullable = false, length = 50)
    private BudgetScopeType scopeType = BudgetScopeType.ORGANIZATION;

    @Column(length = 100)
    private String department;

    @ManyToOne
    @JoinColumn(name = "fund_id")
    private Fund fund;

    @ManyToOne
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @ManyToOne
    @JoinColumn(name = "program_id")
    private Program program;
}
