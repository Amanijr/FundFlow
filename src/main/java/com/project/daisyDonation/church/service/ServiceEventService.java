package com.project.daisyDonation.church.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.church.dto.ServiceEventRequest;
import com.project.daisyDonation.church.dto.ServiceEventResponse;
import com.project.daisyDonation.church.entity.AttendanceRecord;
import com.project.daisyDonation.church.entity.Ministry;
import com.project.daisyDonation.church.entity.ServiceEvent;
import com.project.daisyDonation.church.repository.AttendanceRecordRepository;
import com.project.daisyDonation.church.repository.ServiceEventRepository;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.common.service.VerticalAccess;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServiceEventService {

    private final ServiceEventRepository serviceEventRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final MinistryService ministryService;
    private final TenantSupport tenantSupport;

    @Transactional
    public ServiceEventResponse create(UserPrincipal principal, ServiceEventRequest request) {
        return toResponse(createEntity(principal, request));
    }

    @Transactional
    public ServiceEvent createEntity(UserPrincipal principal, ServiceEventRequest request) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);

        ServiceEvent event = new ServiceEvent();
        event.setOrganization(organization);
        applyRequest(principal, event, request);
        return serviceEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<ServiceEventResponse> list(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);

        return serviceEventRepository
                .findByOrganizationIdAndDeletedFalseOrderByServiceDateDesc(organization.getId())
                .stream()
                .sorted(Comparator.comparing(ServiceEvent::getServiceDate)
                        .reversed()
                        .thenComparing(ServiceEvent::getName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServiceEventResponse getById(UserPrincipal principal, Long serviceEventId) {
        return toResponse(requireServiceEvent(principal, serviceEventId));
    }

    @Transactional
    public ServiceEventResponse update(UserPrincipal principal, Long serviceEventId, ServiceEventRequest request) {
        ServiceEvent event = requireServiceEvent(principal, serviceEventId);
        applyRequest(principal, event, request);
        ServiceEvent saved = serviceEventRepository.save(event);
        attendanceRecordRepository.findByServiceEvent_IdAndDeletedFalse(saved.getId()).ifPresent(record -> {
            record.setEventName(saved.getName());
            record.setServiceDate(saved.getServiceDate());
            record.setMinistry(saved.getMinistry());
            attendanceRecordRepository.save(record);
        });
        return toResponse(saved);
    }

    public ServiceEvent requireServiceEvent(UserPrincipal principal, Long serviceEventId) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);
        return serviceEventRepository
                .findByIdAndOrganizationIdAndDeletedFalse(serviceEventId, organization.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
    }

    private void applyRequest(UserPrincipal principal, ServiceEvent event, ServiceEventRequest request) {
        event.setName(request.getName().trim());
        event.setServiceDate(request.getServiceDate());
        event.setStartsAt(request.getStartsAt());
        event.setLocation(blankToNull(request.getLocation()));
        event.setNotes(blankToNull(request.getNotes()));
        if (request.getMinistryId() != null) {
            Ministry ministry = ministryService.requireMinistry(principal, request.getMinistryId());
            event.setMinistry(ministry);
        } else {
            event.setMinistry(null);
        }
    }

    private ServiceEventResponse toResponse(ServiceEvent event) {
        AttendanceRecord attendance = attendanceRecordRepository
                .findByServiceEvent_IdAndDeletedFalse(event.getId())
                .orElse(null);
        Ministry ministry = event.getMinistry();
        return ServiceEventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .serviceDate(event.getServiceDate())
                .startsAt(event.getStartsAt())
                .location(event.getLocation())
                .ministryId(ministry != null ? ministry.getId() : null)
                .ministryName(ministry != null ? ministry.getName() : null)
                .notes(event.getNotes())
                .attendanceId(attendance != null ? attendance.getId() : null)
                .attendanceCount(attendance != null ? attendance.getAttendanceCount() : null)
                .createdAt(event.getCreatedAt())
                .build();
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
