package com.project.daisyDonation.service.Impl;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.daisyDonation.Dto.DonationResponse;
import com.project.daisyDonation.Entity.Donation;
import com.project.daisyDonation.Entity.Abstract.DonationStatus;
import com.project.daisyDonation.repository.DonationRepository;
import com.project.daisyDonation.service.DonationService;

import jakarta.transaction.Transactional;

@Service
public class DonationServiceImpl implements DonationService{
    
    private static final Logger logger = LoggerFactory.getLogger(DonationServiceImpl.class);

    @Autowired
    private DonationRepository donationRepository;

    @Override
    @Transactional
    public Donation createDonation(Donation donation) {
        donation.setDonationTime(LocalDateTime.now());
        donation.setStatus(DonationStatus.PENDING);
        return donationRepository.save(donation);  
    }
}
    