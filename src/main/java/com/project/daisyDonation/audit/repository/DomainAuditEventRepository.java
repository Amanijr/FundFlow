package com.project.daisyDonation.audit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.audit.entity.DomainAuditEvent;

@Repository
public interface DomainAuditEventRepository extends JpaRepository<DomainAuditEvent, Long> {

    List<DomainAuditEvent> findByOrganizationIdAndEntityTypeAndEntityIdAndDeletedFalseOrderByCreatedAtDesc(
            Long organizationId, String entityType, Long entityId);
}
