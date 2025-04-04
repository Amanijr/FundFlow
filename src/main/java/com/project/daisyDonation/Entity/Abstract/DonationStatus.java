package com.project.daisyDonation.Entity.Abstract;

public enum DonationStatus {

    PENDING,    // Donation has been created but not yet paid
    COMPLETED,  // Donation was successfully processed
    FAILED,     // Payment failed or was rejected
    CANCELLED,  // Donor canceled the donation
    REFUNDED    // Donation was returned
    
}
