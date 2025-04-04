package com.project.daisyDonation.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.Entity.Donation;
import com.project.daisyDonation.Entity.Abstract.DonationStatus;

@Repository
public interface DonationRepository extends JpaRepository <Donation, Long> {

    //Find all Donations By Status
    List<Donation>findByStatus(DonationStatus status);

    //Find all donations for a specific Donor
    List<Donation>findbyDonorId(Long donorId);


    
}
