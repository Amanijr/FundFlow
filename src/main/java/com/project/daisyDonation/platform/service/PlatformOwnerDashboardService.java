package com.project.daisyDonation.platform.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.auth.dto.CreateSuperAdminRequest;
import com.project.daisyDonation.auth.dto.UserResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.PlatformAccess;
import com.project.daisyDonation.organization.dto.OrganizationResponse;
import com.project.daisyDonation.platform.dto.OrganizationStatusRequest;
import com.project.daisyDonation.platform.dto.PlatformUserResponse;
import com.project.daisyDonation.platform.observability.dto.PlatformDashboardResponse;
import com.project.daisyDonation.platform.observability.dto.SystemLogResponse;
import com.project.daisyDonation.platform.observability.entity.LogSeverity;
import com.project.daisyDonation.platform.observability.entity.LogType;
import com.project.daisyDonation.platform.observability.repository.SystemLogRepository;
import com.project.daisyDonation.platform.observability.service.SystemLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlatformOwnerDashboardService {

    private final PlatformService platformService;
    private final SystemLogService systemLogService;
    private final SystemLogRepository systemLogRepository;

    @Transactional(readOnly = true)
    public PlatformDashboardResponse getDashboard(UserPrincipal principal) {
        PlatformAccess.requireSuperAdmin(principal);

        LocalDateTime since = LocalDateTime.now().minusHours(24);
        LocalDateTime now = LocalDateTime.now();
        var stats = platformService.stats(principal);

        return PlatformDashboardResponse.builder()
                .platformStats(stats)
                .inactiveOrganizations(stats.getTotalOrganizations() - stats.getActiveOrganizations())
                .logsLast24Hours(systemLogRepository.countByCreatedAtBetween(since, now))
                .errorsLast24Hours(systemLogRepository.countBySeverityInAndCreatedAtBetween(
                        List.of(LogSeverity.ERROR, LogSeverity.CRITICAL), since, now))
                .securityEventsLast24Hours(systemLogRepository.countByLogTypeAndCreatedAtBetween(
                        LogType.SECURITY, since, now))
                .unresolvedAlerts(systemLogRepository.countByLogTypeAndAlertResolvedFalse(LogType.ALERT))
                .organizations(platformService.listOrganizations(principal))
                .users(platformService.listUsers(principal))
                .recentActivity(systemLogRepository.findTop50ByOrderByCreatedAtDesc().stream()
                        .map(systemLogService::toResponse)
                        .toList())
                .recentAlerts(systemLogRepository.findTop20ByLogTypeOrderByCreatedAtDesc(LogType.ALERT).stream()
                        .map(systemLogService::toResponse)
                        .toList())
                .recentErrors(systemLogRepository.findTop20BySeverityInOrderByCreatedAtDesc(
                        List.of(LogSeverity.ERROR, LogSeverity.CRITICAL)).stream()
                        .map(systemLogService::toResponse)
                        .toList())
                .build();
    }

    @Transactional(readOnly = true)
    public List<SystemLogResponse> searchLogs(
            UserPrincipal principal,
            LogType logType,
            LogSeverity severity,
            String category,
            Long organizationId,
            boolean alertsOnly,
            LocalDate from,
            LocalDate to) {
        return systemLogService.search(principal, logType, severity, category, organizationId, alertsOnly, from, to);
    }

    @Transactional(readOnly = true)
    public SystemLogResponse getLog(UserPrincipal principal, Long id) {
        return systemLogService.getById(principal, id);
    }

    @Transactional
    public SystemLogResponse resolveAlert(UserPrincipal principal, Long id) {
        return systemLogService.resolveAlert(principal, id);
    }

    @Transactional(readOnly = true)
    public List<OrganizationResponse> listOrganizations(UserPrincipal principal) {
        return platformService.listOrganizations(principal);
    }

    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization(UserPrincipal principal, Long organizationId) {
        return platformService.getOrganization(principal, organizationId);
    }

    @Transactional
    public OrganizationResponse updateOrganizationStatus(
            UserPrincipal principal, Long organizationId, OrganizationStatusRequest request) {
        return platformService.updateOrganizationStatus(principal, organizationId, request);
    }

    @Transactional(readOnly = true)
    public List<PlatformUserResponse> listUsers(UserPrincipal principal) {
        return platformService.listUsers(principal);
    }

    @Transactional
    public UserResponse createSuperAdmin(UserPrincipal principal, CreateSuperAdminRequest request) {
        return platformService.createSuperAdmin(principal, request);
    }
}
