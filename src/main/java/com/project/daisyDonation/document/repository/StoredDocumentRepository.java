package com.project.daisyDonation.document.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.daisyDonation.document.entity.StoredDocument;

public interface StoredDocumentRepository extends JpaRepository<StoredDocument, Long> {

    List<StoredDocument> findByOrganizationIdAndDeletedFalseOrderByCreatedAtDesc(Long organizationId);

    Optional<StoredDocument> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);
}
