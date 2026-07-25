package com.project.daisyDonation.church.entity;

import java.time.LocalDate;

import com.project.daisyDonation.common.entity.TenantEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "attendance_record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecord extends TenantEntity {

    @ManyToOne
    @JoinColumn(name = "ministry_id")
    private Ministry ministry;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "event_name", nullable = false, length = 255)
    private String eventName;

    @Column(name = "attendance_count", nullable = false)
    private int attendanceCount;

    @Column(length = 1000)
    private String notes;

    @Column(name = "recorded_by_user_id")
    private Long recordedByUserId;
}
