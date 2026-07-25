package com.project.daisyDonation.school.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.school.entity.StudentSponsorship;

@Repository
public interface StudentSponsorshipRepository extends JpaRepository<StudentSponsorship, Long> {

    List<StudentSponsorship> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<StudentSponsorship> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    List<StudentSponsorship> findByBeneficiaryIdAndOrganizationIdAndDeletedFalse(
            Long beneficiaryId, Long organizationId);
}
