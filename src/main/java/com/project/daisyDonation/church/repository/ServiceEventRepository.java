package com.project.daisyDonation.church.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.daisyDonation.church.entity.ServiceEvent;

@Repository
public interface ServiceEventRepository extends JpaRepository<ServiceEvent, Long> {

    List<ServiceEvent> findByOrganizationIdAndDeletedFalseOrderByServiceDateDesc(Long organizationId);

    Optional<ServiceEvent> findByIdAndOrganizationIdAndDeletedFalse(Long id, Long organizationId);
}
