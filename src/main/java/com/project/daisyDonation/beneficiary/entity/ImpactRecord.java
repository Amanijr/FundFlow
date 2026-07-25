package com.project.daisyDonation.beneficiary.entity;

import java.time.LocalDate;

import com.project.daisyDonation.common.entity.TenantEntity;
import com.project.daisyDonation.program.entity.Program;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "impact_record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImpactRecord extends TenantEntity {

    @ManyToOne
    @JoinColumn(name = "beneficiary_id")
    private Beneficiary beneficiary;

    @ManyToOne
    @JoinColumn(name = "program_id")
    private Program program;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "recorded_date", nullable = false)
    private LocalDate recordedDate;

    @Column(name = "outcome_metric", length = 255)
    private String outcomeMetric;

    @Column(name = "outcome_value", length = 255)
    private String outcomeValue;
}
