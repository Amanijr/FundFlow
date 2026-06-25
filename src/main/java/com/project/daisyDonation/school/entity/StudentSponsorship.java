package com.project.daisyDonation.school.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.project.daisyDonation.beneficiary.entity.Beneficiary;
import com.project.daisyDonation.common.entity.TenantEntity;
import com.project.daisyDonation.donor.entity.Donor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "student_sponsorship")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentSponsorship extends TenantEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "beneficiary_id", nullable = false)
    private Beneficiary beneficiary;

    @ManyToOne(optional = false)
    @JoinColumn(name = "donor_id", nullable = false)
    private Donor donor;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    @Column(length = 50)
    private String term;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SponsorshipStatus status = SponsorshipStatus.ACTIVE;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(length = 1000)
    private String notes;
}
