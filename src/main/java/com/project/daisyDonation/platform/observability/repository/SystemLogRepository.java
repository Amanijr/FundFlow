package com.project.daisyDonation.platform.observability.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.project.daisyDonation.platform.observability.entity.LogSeverity;
import com.project.daisyDonation.platform.observability.entity.LogType;
import com.project.daisyDonation.platform.observability.entity.SystemLog;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {

    @Query("""
            SELECT s FROM SystemLog s
            WHERE (:logType IS NULL OR s.logType = :logType)
              AND (:severity IS NULL OR s.severity = :severity)
              AND (:category IS NULL OR s.category = :category)
              AND (:organizationId IS NULL OR s.organizationId = :organizationId)
              AND (:alertsOnly = false OR (s.logType = com.project.daisyDonation.platform.observability.entity.LogType.ALERT AND s.alertResolved = false))
              AND s.createdAt >= :fromDateTime
              AND s.createdAt <= :toDateTime
            ORDER BY s.createdAt DESC
            """)
    List<SystemLog> search(
            @Param("logType") LogType logType,
            @Param("severity") LogSeverity severity,
            @Param("category") String category,
            @Param("organizationId") Long organizationId,
            @Param("alertsOnly") boolean alertsOnly,
            @Param("fromDateTime") LocalDateTime fromDateTime,
            @Param("toDateTime") LocalDateTime toDateTime);

    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);

    long countBySeverityInAndCreatedAtBetween(
            List<LogSeverity> severities, LocalDateTime from, LocalDateTime to);

    long countByLogTypeAndAlertResolvedFalse(LogType logType);

    long countByLogTypeAndCreatedAtBetween(LogType logType, LocalDateTime from, LocalDateTime to);

    List<SystemLog> findTop50ByOrderByCreatedAtDesc();

    List<SystemLog> findTop20ByLogTypeOrderByCreatedAtDesc(LogType logType);

    List<SystemLog> findTop20BySeverityInOrderByCreatedAtDesc(List<LogSeverity> severities);
}
