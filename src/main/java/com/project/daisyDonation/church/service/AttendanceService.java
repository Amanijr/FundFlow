package com.project.daisyDonation.church.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.church.dto.AttendanceRecordRequest;
import com.project.daisyDonation.church.dto.AttendanceRecordResponse;
import com.project.daisyDonation.church.dto.AttendanceSummaryResponse;
import com.project.daisyDonation.church.dto.ServiceEventRequest;
import com.project.daisyDonation.church.entity.AttendanceRecord;
import com.project.daisyDonation.church.entity.Ministry;
import com.project.daisyDonation.church.entity.ServiceEvent;
import com.project.daisyDonation.church.repository.AttendanceRecordRepository;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.common.service.VerticalAccess;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final ServiceEventService serviceEventService;
    private final MinistryService ministryService;
    private final TenantSupport tenantSupport;

    @Transactional
    public AttendanceRecordResponse record(UserPrincipal principal, AttendanceRecordRequest request) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);

        ServiceEvent serviceEvent = resolveServiceEvent(principal, request);
        if (attendanceRecordRepository.existsByServiceEvent_IdAndDeletedFalse(serviceEvent.getId())) {
            throw new ConflictException("Attendance is already recorded for this service");
        }

        AttendanceRecord record = new AttendanceRecord();
        record.setOrganization(organization);
        record.setServiceEvent(serviceEvent);
        record.setServiceDate(serviceEvent.getServiceDate());
        record.setEventName(serviceEvent.getName());
        record.setMinistry(serviceEvent.getMinistry());
        record.setAttendanceCount(request.getAttendanceCount());
        record.setNotes(request.getNotes() != null ? request.getNotes() : serviceEvent.getNotes());
        record.setRecordedByUserId(principal.getId());

        return toResponse(attendanceRecordRepository.save(record));
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> list(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);

        return attendanceRecordRepository
                .findByOrganizationIdAndDeletedFalseOrderByServiceDateDesc(organization.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AttendanceSummaryResponse summary(UserPrincipal principal, LocalDate from, LocalDate to) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);

        LocalDate fromDate = from != null ? from : LocalDate.now().withDayOfYear(1);
        LocalDate toDate = to != null ? to : LocalDate.now();

        long total = attendanceRecordRepository.sumAttendance(organization.getId(), fromDate, toDate);
        long count = attendanceRecordRepository
                .findByOrganizationIdAndDeletedFalseOrderByServiceDateDesc(organization.getId())
                .stream()
                .filter(r -> !r.getServiceDate().isBefore(fromDate) && !r.getServiceDate().isAfter(toDate))
                .count();

        return AttendanceSummaryResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .totalAttendance(total)
                .recordCount(count)
                .build();
    }

    @Transactional(readOnly = true)
    public AttendanceRecordResponse getById(UserPrincipal principal, Long recordId) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireChurch(organization);

        AttendanceRecord record = attendanceRecordRepository
                .findByIdAndOrganizationIdAndDeletedFalse(recordId, organization.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found"));
        return toResponse(record);
    }

    private ServiceEvent resolveServiceEvent(UserPrincipal principal, AttendanceRecordRequest request) {
        if (request.getServiceEventId() != null) {
            return serviceEventService.requireServiceEvent(principal, request.getServiceEventId());
        }
        if (request.getServiceDate() == null || request.getEventName() == null || request.getEventName().isBlank()) {
            throw new BadRequestException("Choose a service, or enter a date and event name");
        }
        return serviceEventService.createEntity(
                principal,
                ServiceEventRequest.builder()
                        .name(request.getEventName().trim())
                        .serviceDate(request.getServiceDate())
                        .ministryId(request.getMinistryId())
                        .notes(request.getNotes())
                        .build());
    }

    private AttendanceRecordResponse toResponse(AttendanceRecord record) {
        Ministry ministry = record.getMinistry();
        ServiceEvent serviceEvent = record.getServiceEvent();
        return AttendanceRecordResponse.builder()
                .id(record.getId())
                .serviceEventId(serviceEvent != null ? serviceEvent.getId() : null)
                .ministryId(ministry != null ? ministry.getId() : null)
                .ministryName(ministry != null ? ministry.getName() : null)
                .serviceDate(record.getServiceDate())
                .eventName(record.getEventName())
                .attendanceCount(record.getAttendanceCount())
                .notes(record.getNotes())
                .recordedByUserId(record.getRecordedByUserId())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
