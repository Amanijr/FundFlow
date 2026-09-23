package com.project.daisyDonation.church.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.project.daisyDonation.common.entity.TenantEntity;
import com.project.daisyDonation.fund.entity.Fund;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "church_partnership")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Partnership extends TenantEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fund_id")
    private Fund fund;

    @Column(name = "monthly_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal monthlyAmount;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PartnershipStatus status = PartnershipStatus.ACTIVE;

    @Column(length = 2000)
    private String notes;
}
