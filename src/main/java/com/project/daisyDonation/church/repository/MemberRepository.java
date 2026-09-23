package com.project.daisyDonation.church.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.church.entity.Member;
import com.project.daisyDonation.donor.entity.MembershipStatus;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    List<Member> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<Member> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    boolean existsByOrganizationIdAndMemberNumberIgnoreCaseAndDeletedFalse(Long organizationId, String memberNumber);

    boolean existsByOrganizationIdAndEmailAndDeletedFalse(Long organizationId, String email);

    boolean existsByOrganizationIdAndPhoneAndDeletedFalse(Long organizationId, String phone);

    long countByOrganizationIdAndDeletedFalse(Long organizationId);

    long countByOrganizationId(Long organizationId);

    long countByOrganizationIdAndMembershipStatusAndDeletedFalse(
            Long organizationId, MembershipStatus membershipStatus);
}
