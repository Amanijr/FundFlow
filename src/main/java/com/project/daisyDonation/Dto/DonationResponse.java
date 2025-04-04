package com.project.daisyDonation.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DonationResponse {
    
    private boolean success;
    private String message;
    private Long donationId;

    public DonationResponse(boolean success, String message, Long donationId) {
        this.success = success;
        this.message = message;
        this.donationId = donationId;
    }



}
