package com.project.daisyDonation.Dto;

import java.util.List;

import org.hibernate.annotations.processing.Pattern;

import com.project.daisyDonation.Entity.Donation;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class DonorDto {
  
       private Long id;
    
    private String firstName;
    
    private String lastName;
    
    private String email;
    
    private String phone;
    
    private String address;
    private String city;
    private String state;
    private String country;
    
    private List<Donation> donations;
    
}
