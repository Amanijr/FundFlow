package com.project.daisyDonation.Entity;

import java.time.LocalDateTime;

import com.project.daisyDonation.Entity.Abstract.Abstract;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Payment")
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor

public class Payment extends Abstract{

    @OneToOne
    @JoinColumn(name = "donation_id", nullable = false)
    private Donation donation;

    private String paymentMethod;
    private String transactionId;
    private Boolean successful;
    private LocalDateTime processedAt;


    
}
