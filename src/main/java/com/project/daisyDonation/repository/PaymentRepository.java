package com.project.daisyDonation.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.daisyDonation.Entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    
} 
