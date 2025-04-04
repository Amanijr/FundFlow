package com.project.daisyDonation.Entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.Entity.Abstract.Abstract;
import com.project.daisyDonation.Entity.Abstract.DonationStatus;

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
public class Donation extends Abstract{


    @ManyToOne
    @JoinColumn(name = "donor_id", nullable = false)
    private Donor donor;

    private BigDecimal amount;
    private LocalDateTime donationTime;

    @Enumerated(EnumType.STRING)
    private DonationStatus status;

}
