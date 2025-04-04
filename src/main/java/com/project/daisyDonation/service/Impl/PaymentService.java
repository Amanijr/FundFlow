package com.project.daisyDonation.service.Impl;

import org.springframework.beans.factory.annotation.Autowired;

import com.project.daisyDonation.Entity.Donation;
import com.project.daisyDonation.Entity.Payment;
import com.project.daisyDonation.repository.DonationRepository;
import com.project.daisyDonation.repository.PaymentRepository;

public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private DonationRepository donationRepository;

    public Payment processPayment(Long donationId, String paymentMethod){
        Donation donation = donationRepository.findById(donationId)
        .orElseThrow(() ->new RuntimeException("Donation not Found"));

            //call payment gateway API 
            boolean success = paymentGateway.process(donation.getAmount(),paymentMethod);
    }



    
}
