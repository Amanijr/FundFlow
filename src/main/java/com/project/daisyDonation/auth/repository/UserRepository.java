package com.project.daisyDonation.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.daisyDonation.auth.entity.Role;
import com.project.daisyDonation.auth.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndDeletedFalse(String email);

    Optional<User> findByIdAndDeletedFalse(Long id);

    boolean existsByEmailAndDeletedFalse(String email);

    List<User> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<User> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    List<User> findByDeletedFalseOrderByEmailAsc();

    long countByDeletedFalse();

    long countByRoleAndDeletedFalse(Role role);

    boolean existsByRoleAndDeletedFalse(Role role);
}
