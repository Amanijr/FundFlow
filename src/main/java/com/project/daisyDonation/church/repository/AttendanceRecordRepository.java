package com.project.daisyDonation.church.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.church.entity.AttendanceRecord;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findByOrganizationIdAndDeletedFalseOrderByServiceDateDesc(Long organizationId);

    Optional<AttendanceRecord> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    @Query("""
            SELECT COALESCE(SUM(a.attendanceCount), 0) FROM AttendanceRecord a
            WHERE a.organization.id = :organizationId
              AND a.deleted = false
              AND (:fromDate IS NULL OR a.serviceDate >= :fromDate)
              AND (:toDate IS NULL OR a.serviceDate <= :toDate)
            """)
    long sumAttendance(
            @Param("organizationId") Long organizationId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);
}
