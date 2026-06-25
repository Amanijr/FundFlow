package com.project.daisyDonation.communication.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.communication.entity.CommunicationLog;
import com.project.daisyDonation.communication.entity.CommunicationReferenceType;

@Repository
public interface CommunicationLogRepository extends JpaRepository<CommunicationLog, Long> {

    List<CommunicationLog> findByOrganizationIdAndDeletedFalseOrderByCreatedAtDesc(Long organizationId);

    List<CommunicationLog> findByOrganizationIdAndReferenceTypeAndReferenceIdAndDeletedFalseOrderByCreatedAtDesc(
            Long organizationId, CommunicationReferenceType referenceType, Long referenceId);
}
