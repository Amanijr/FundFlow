package com.project.daisyDonation.fund.entity;

import java.math.BigDecimal;

import com.project.daisyDonation.common.entity.TenantEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "fund",
        uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "code"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Fund extends TenantEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FundType type;

    @Column(length = 1000)
    private String description;

    @Column(name = "opening_balance", nullable = false, precision = 19, scale = 2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean active = true;
}
