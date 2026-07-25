package com.project.daisyDonation.recurring.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.project.daisyDonation.common.entity.TenantEntity;
import com.project.daisyDonation.donor.entity.Donor;
import com.project.daisyDonation.campaign.entity.Campaign;

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
@Table(name = "recurring_donation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecurringDonation extends TenantEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    private Donor donor;

    @ManyToOne
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RecurringFrequency frequency;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean active = true;

    @Column(length = 500)
    private String notes;
}
