package com.project.daisyDonation.grant.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "grant_record",
        uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "grant_code"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Grant extends TenantEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "grant_code", nullable = false, length = 50)
    private String grantCode;

    @Column(name = "funder_name", nullable = false, length = 255)
    private String funderName;

    @Column(name = "awarded_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal awardedAmount;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private GrantStatus status = GrantStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "restriction_type", nullable = false, length = 50)
    private GrantRestrictionType restrictionType = GrantRestrictionType.FULLY_RESTRICTED;

    @Column(name = "restriction_notes", length = 2000)
    private String restrictionNotes;

    @Enumerated(EnumType.STRING)
    @Column(name = "compliance_status", nullable = false, length = 50)
    private GrantComplianceStatus complianceStatus = GrantComplianceStatus.PENDING;

    @Column(name = "compliance_notes", length = 2000)
    private String complianceNotes;

    @ManyToOne
    @JoinColumn(name = "program_id")
    private Program program;

    @ManyToOne
    @JoinColumn(name = "fund_id")
    private Fund fund;
}
