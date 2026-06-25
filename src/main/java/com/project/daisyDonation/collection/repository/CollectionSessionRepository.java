package com.project.daisyDonation.collection.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.collection.entity.CollectionSession;
import com.project.daisyDonation.collection.entity.CollectionSessionStatus;
import com.project.daisyDonation.collection.entity.CollectionType;

@Repository
public interface CollectionSessionRepository extends JpaRepository<CollectionSession, Long> {

    List<CollectionSession> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<CollectionSession> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    List<CollectionSession> findByOrganizationIdAndCollectionTypeAndDeletedFalse(
            Long organizationId, CollectionType collectionType);

    List<CollectionSession> findByOrganizationIdAndStatusAndDeletedFalse(
            Long organizationId, CollectionSessionStatus status);

    @Query("""
            SELECT COALESCE(SUM(cs.totalAmount), 0) FROM CollectionSession cs
            WHERE cs.organization.id = :organizationId
              AND cs.collectionType = :collectionType
              AND cs.status = com.project.daisyDonation.collection.entity.CollectionSessionStatus.VERIFIED
              AND cs.deleted = false
            """)
    BigDecimal sumVerifiedAmountByType(
            @Param("organizationId") Long organizationId,
            @Param("collectionType") CollectionType collectionType);

    @Query("""
            SELECT COUNT(cs) FROM CollectionSession cs
            WHERE cs.organization.id = :organizationId
              AND cs.collectionType = :collectionType
              AND cs.status = com.project.daisyDonation.collection.entity.CollectionSessionStatus.VERIFIED
              AND cs.deleted = false
            """)
    long countVerifiedByType(
            @Param("organizationId") Long organizationId,
            @Param("collectionType") CollectionType collectionType);
}
