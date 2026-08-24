package com.project.daisyDonation.document.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.daisyDonation.document.entity.StoredDocumentContent;

public interface StoredDocumentContentRepository extends JpaRepository<StoredDocumentContent, Long> {

    Optional<StoredDocumentContent> findByDocumentId(Long documentId);
}
