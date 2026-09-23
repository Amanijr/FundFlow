package com.project.daisyDonation.church.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import com.project.daisyDonation.common.entity.TenantEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "service_event")
@Getter
@Setter
@NoArgsConstructor
public class ServiceEvent extends TenantEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ministry_id")
    private Ministry ministry;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "starts_at")
    private LocalTime startsAt;

    @Column(length = 255)
    private String location;

    @Column(length = 1000)
    private String notes;
}
