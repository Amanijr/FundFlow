package com.project.daisyDonation.church.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.church.entity.MemberMinistry;
import com.project.daisyDonation.church.entity.MemberMinistryStatus;

@Repository
public interface MemberMinistryRepository extends JpaRepository<MemberMinistry, Long> {

    List<MemberMinistry> findByMinistry_IdAndOrganizationIdAndDeletedFalse(Long ministryId, Long organizationId);

    List<MemberMinistry> findByMember_IdAndOrganizationIdAndDeletedFalse(Long memberId, Long organizationId);

    Optional<MemberMinistry> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    Optional<MemberMinistry> findByOrganizationIdAndMember_IdAndMinistry_IdAndDeletedFalse(
            Long organizationId, Long memberId, Long ministryId);

    long countByMinistry_IdAndOrganizationIdAndStatusAndDeletedFalse(
            Long ministryId, Long organizationId, MemberMinistryStatus status);
}
