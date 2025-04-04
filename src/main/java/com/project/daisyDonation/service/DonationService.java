package com.project.daisyDonation.service;

import org.springframework.validation.annotation.Validated;

import com.project.daisyDonation.Entity.Donation;

public interface DonationService {
    Donation createDonation(Donation donation);
}
