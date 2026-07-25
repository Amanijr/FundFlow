package com.project.daisyDonation.program.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.program.entity.Program;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {

    List<Program> findByOrganizationIdAndDeletedFalse(Long organizationId);

    Optional<Program> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);

    boolean existsByOrganizationIdAndCodeAndDeletedFalse(Long organizationId, String code);
}
