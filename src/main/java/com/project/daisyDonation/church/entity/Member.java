package com.project.daisyDonation.church.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.project.daisyDonation.auth.entity.User;
import com.project.daisyDonation.common.entity.TenantEntity;
import com.project.daisyDonation.donation.entity.Donation;
import com.project.daisyDonation.donor.entity.MembershipStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "church_member",
        uniqueConstraints = @UniqueConstraint(columnNames = {"organization_id", "member_number"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Member extends TenantEntity {

    @Column(name = "member_number", nullable = false, length = 32)
    private String memberNumber;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(length = 100)
    private String email;

    @Column(length = 255)
    private String address;

    @Column(length = 15)
    private String phone;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String country;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_status", nullable = false, length = 50)
    private MembershipStatus membershipStatus = MembershipStatus.ACTIVE;

    @Column(name = "joined_at")
    private LocalDate joinedAt;

    @Column(length = 2000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "member")
    private List<Donation> gifts = new ArrayList<>();
}
