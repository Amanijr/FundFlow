package com.project.daisyDonation.accounting.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.accounting.entity.JournalEntry;
import com.project.daisyDonation.accounting.entity.JournalSourceType;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {

    List<JournalEntry> findByOrganizationIdAndDeletedFalseOrderByEntryDateDescCreatedAtDesc(Long organizationId);

    Optional<JournalEntry> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    boolean existsByOrganizationIdAndSourceTypeAndSourceIdAndDeletedFalse(
            Long organizationId, JournalSourceType sourceType, Long sourceId);

    Optional<JournalEntry> findByOrganizationIdAndSourceTypeAndSourceIdAndDeletedFalse(
            Long organizationId, JournalSourceType sourceType, Long sourceId);
}
