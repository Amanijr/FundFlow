package com.project.daisyDonation.pledge.entity;

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
@Table(name = "pledge")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Pledge extends TenantEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    private Donor donor;

    @ManyToOne
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @Column(name = "pledged_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal pledgedAmount;

    @Column(name = "fulfilled_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal fulfilledAmount = BigDecimal.ZERO;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PledgeStatus status = PledgeStatus.OPEN;

    @Column(length = 1000)
    private String notes;
}
