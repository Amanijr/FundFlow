package com.project.daisyDonation.platform.observability.service;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.TenantContext;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.PlatformAccess;
import com.project.daisyDonation.platform.observability.dto.SystemLogResponse;
import com.project.daisyDonation.platform.observability.entity.LogSeverity;
import com.project.daisyDonation.platform.observability.entity.LogType;
import com.project.daisyDonation.platform.observability.entity.SystemLog;
import com.project.daisyDonation.platform.observability.repository.SystemLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemLogService {

    private static final int STACK_TRACE_MAX_LENGTH = 8000;

    private final SystemLogRepository systemLogRepository;

    @Async
    @Transactional
    public void recordEvent(String category, String message, String details) {
        persist(SystemLog.builder()
                .logType(LogType.EVENT)
                .severity(LogSeverity.INFO)
                .category(category)
                .message(truncate(message, 2000))
                .details(details)
                .organizationId(TenantContext.getOrganizationId())
                .build());
    }

    @Async
    @Transactional
    public void recordSecurity(String category, String message, String details, String userEmail) {
        SystemLog entry = SystemLog.builder()
                .logType(LogType.SECURITY)
                .severity(LogSeverity.WARNING)
                .category(category)
                .message(truncate(message, 2000))
                .details(details)
                .userEmail(userEmail)
                .organizationId(TenantContext.getOrganizationId())
                .build();
        persist(entry);
        maybeCreateAlert(entry, "Security event detected");
    }

    @Async
    @Transactional
    public void recordApiRequest(
            String method,
            String path,
            int status,
            long durationMs,
            UserPrincipal principal) {
        if (shouldSkipPath(path)) {
            return;
        }

        LogSeverity severity = resolveApiSeverity(status);
        LogType logType = status >= 500 ? LogType.ERROR : LogType.EVENT;
        String message = "%s %s -> %d (%dms)".formatted(method, path, status, durationMs);

        SystemLog entry = SystemLog.builder()
                .logType(logType)
                .severity(severity)
                .category("API")
                .message(truncate(message, 2000))
                .details("durationMs=" + durationMs)
                .requestMethod(method)
                .requestPath(truncate(path, 500))
                .httpStatus(status)
                .organizationId(resolveOrganizationId(principal))
                .userId(principal != null ? principal.getId() : null)
                .userEmail(principal != null ? principal.getEmail() : null)
                .build();

        persist(entry);
        if (status >= 500) {
            maybeCreateAlert(entry, "Server error on API request");
        }
    }

    @Async
    @Transactional
    public void recordHandledException(
            Exception ex,
            int httpStatus,
            String category,
            UserPrincipal principal,
            String method,
            String path) {
        LogSeverity severity = httpStatus >= 500 ? LogSeverity.ERROR : LogSeverity.WARNING;
        LogType logType = httpStatus >= 500 ? LogType.EXCEPTION : LogType.ERROR;

        SystemLog entry = SystemLog.builder()
                .logType(logType)
                .severity(severity)
                .category(category)
                .message(truncate(ex.getMessage() != null ? ex.getMessage() : ex.getClass().getSimpleName(), 2000))
                .requestMethod(method)
                .requestPath(path != null ? truncate(path, 500) : null)
                .httpStatus(httpStatus)
                .exceptionType(ex.getClass().getName())
                .stackTrace(truncateStackTrace(ex))
                .organizationId(resolveOrganizationId(principal))
                .userId(principal != null ? principal.getId() : null)
                .userEmail(principal != null ? principal.getEmail() : null)
                .build();

        persist(entry);
        if (httpStatus >= 500 || severity == LogSeverity.CRITICAL) {
            maybeCreateAlert(entry, "Unhandled or critical application error");
        }
    }

    @Async
    @Transactional
    public void recordPlatformAction(UserPrincipal principal, String category, String message, String details) {
        SystemLog entry = SystemLog.builder()
                .logType(LogType.EVENT)
                .severity(LogSeverity.INFO)
                .category(category)
                .message(truncate(message, 2000))
                .details(details)
                .userId(principal != null ? principal.getId() : null)
                .userEmail(principal != null ? principal.getEmail() : null)
                .build();
        persist(entry);
    }

    @Transactional(readOnly = true)
    public List<SystemLogResponse> search(
            UserPrincipal principal,
            LogType logType,
            LogSeverity severity,
            String category,
            Long organizationId,
            boolean alertsOnly,
            LocalDate from,
            LocalDate to) {
        PlatformAccess.requireSuperAdmin(principal);

        LocalDateTime fromDateTime = (from != null ? from : LocalDate.now().minusDays(7)).atStartOfDay();
        LocalDateTime toDateTime = (to != null ? to : LocalDate.now()).atTime(23, 59, 59);

        return systemLogRepository.search(logType, severity, category, organizationId, alertsOnly, fromDateTime, toDateTime)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SystemLogResponse getById(UserPrincipal principal, Long id) {
        PlatformAccess.requireSuperAdmin(principal);
        return systemLogRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("System log entry not found"));
    }

    @Transactional
    public SystemLogResponse resolveAlert(UserPrincipal principal, Long id) {
        PlatformAccess.requireSuperAdmin(principal);

        SystemLog entry = systemLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("System log entry not found"));

        if (entry.getLogType() != LogType.ALERT) {
            throw new com.project.daisyDonation.common.exception.BadRequestException("Only alert entries can be resolved");
        }

        entry.setAlertResolved(true);
        recordPlatformAction(principal, "PLATFORM", "Alert resolved", "alertId=" + id);
        return toResponse(systemLogRepository.save(entry));
    }

    private void maybeCreateAlert(SystemLog source, String alertMessage) {
        SystemLog alert = SystemLog.builder()
                .logType(LogType.ALERT)
                .severity(source.getSeverity() == LogSeverity.WARNING ? LogSeverity.WARNING : LogSeverity.CRITICAL)
                .category("ALERT")
                .message(truncate(alertMessage + ": " + source.getMessage(), 2000))
                .details("sourceLogType=" + source.getLogType() + ", category=" + source.getCategory())
                .organizationId(source.getOrganizationId())
                .userId(source.getUserId())
                .userEmail(source.getUserEmail())
                .requestMethod(source.getRequestMethod())
                .requestPath(source.getRequestPath())
                .httpStatus(source.getHttpStatus())
                .exceptionType(source.getExceptionType())
                .build();
        persist(alert);
    }

    private void persist(SystemLog entry) {
        try {
            systemLogRepository.save(entry);
        } catch (Exception ex) {
            log.error("Failed to persist system log entry", ex);
        }
    }

    private LogSeverity resolveApiSeverity(int status) {
        if (status >= 500) {
            return LogSeverity.ERROR;
        }
        if (status >= 400) {
            return LogSeverity.WARNING;
        }
        return LogSeverity.INFO;
    }

    private boolean shouldSkipPath(String path) {
        if (path == null) {
            return true;
        }
        return path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/actuator");
    }

    private Long resolveOrganizationId(UserPrincipal principal) {
        Long organizationId = TenantContext.getOrganizationId();
        if (organizationId != null) {
            return organizationId;
        }
        return principal != null ? principal.getOrganizationId() : null;
    }

    private String truncateStackTrace(Exception ex) {
        StringWriter writer = new StringWriter();
        ex.printStackTrace(new PrintWriter(writer));
        return truncate(writer.toString(), STACK_TRACE_MAX_LENGTH);
    }

    private String truncate(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        return value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    public SystemLogResponse toResponse(SystemLog entry) {
        return SystemLogResponse.builder()
                .id(entry.getId())
                .logType(entry.getLogType())
                .severity(entry.getSeverity())
                .category(entry.getCategory())
                .message(entry.getMessage())
                .details(entry.getDetails())
                .organizationId(entry.getOrganizationId())
                .userId(entry.getUserId())
                .userEmail(entry.getUserEmail())
                .requestMethod(entry.getRequestMethod())
                .requestPath(entry.getRequestPath())
                .httpStatus(entry.getHttpStatus())
                .exceptionType(entry.getExceptionType())
                .alertResolved(entry.isAlertResolved())
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
