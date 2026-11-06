package com.project.daisyDonation.donation.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.campaign.entity.Campaign;
import com.project.daisyDonation.collection.entity.CollectionSession;
import com.project.daisyDonation.common.entity.TenantEntity;
import com.project.daisyDonation.donor.entity.Donor;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.pledge.entity.Pledge;
import com.project.daisyDonation.recurring.entity.RecurringDonation;

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
import lombok.ToString;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "donation")
public class Donation extends TenantEntity {

    @ManyToOne
    @JoinColumn(name = "donor_id")
    private Donor donor;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    private LocalDateTime donationTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private DonationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "donation_type", nullable = false, length = 50)
    private DonationType donationType = DonationType.ONE_TIME;

    @Column(name = "is_anonymous", nullable = false)
    private boolean anonymous = false;

    @ManyToOne
    @JoinColumn(name = "campaign_id")
    private Campaign campaign;

    @ManyToOne
    @JoinColumn(name = "pledge_id")
    private Pledge pledge;

    @ManyToOne
    @JoinColumn(name = "recurring_donation_id")
    private RecurringDonation recurringDonation;

    @ManyToOne
    @JoinColumn(name = "collection_session_id")
    private CollectionSession collectionSession;

    @ManyToOne
    @JoinColumn(name = "fund_id")
    private Fund fund;

    @Column(length = 100)
    private String source;

    @Column(length = 1000)
    private String notes;

    @Column(name = "item_description", length = 500)
    private String itemDescription;

    @Column(name = "estimated_value", precision = 19, scale = 2)
    private BigDecimal estimatedValue;
}
