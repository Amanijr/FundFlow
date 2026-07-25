package com.project.daisyDonation.donor.entity;

import java.util.ArrayList;
import java.util.List;

import com.project.daisyDonation.common.entity.TenantEntity;
import com.project.daisyDonation.donation.entity.Donation;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "donor",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"organization_id", "email"}),
                @UniqueConstraint(columnNames = {"organization_id", "phone"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Donor extends TenantEntity {

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 255)
    private String address;

    @Column(nullable = false, length = 15)
    private String phone;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String country;

    @OneToMany(mappedBy = "donor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Donation> donations = new ArrayList<>();
}
