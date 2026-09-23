package com.project.daisyDonation.audit.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.audit.dto.DomainAuditEventResponse;
import com.project.daisyDonation.audit.entity.DomainAuditEvent;
import com.project.daisyDonation.audit.repository.DomainAuditEventRepository;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DomainAuditService {

    private final DomainAuditEventRepository domainAuditEventRepository;
    private final TenantSupport tenantSupport;

    @Transactional
    public void record(UserPrincipal principal, String action, String entityType, Long entityId, String details) {
        Organization organization = tenantSupport.organization(principal);
        DomainAuditEvent event = new DomainAuditEvent();
        event.setOrganization(organization);
        event.setActorUserId(principal.getId());
        event.setAction(action);
        event.setEntityType(entityType);
        event.setEntityId(entityId);
        event.setDetails(details);
        domainAuditEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<DomainAuditEventResponse> listForEntity(UserPrincipal principal, String entityType, Long entityId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return domainAuditEventRepository
                .findByOrganizationIdAndEntityTypeAndEntityIdAndDeletedFalseOrderByCreatedAtDesc(
                        organizationId, entityType, entityId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private DomainAuditEventResponse toResponse(DomainAuditEvent event) {
        return DomainAuditEventResponse.builder()
                .id(event.getId())
                .actorUserId(event.getActorUserId())
                .action(event.getAction())
                .entityType(event.getEntityType())
                .entityId(event.getEntityId())
                .details(event.getDetails())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
