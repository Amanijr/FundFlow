package com.project.daisyDonation.beneficiary.service;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.beneficiary.dto.BeneficiaryRequest;
import com.project.daisyDonation.beneficiary.dto.BeneficiaryResponse;
import com.project.daisyDonation.beneficiary.dto.ImpactRecordRequest;
import com.project.daisyDonation.beneficiary.dto.ImpactRecordResponse;
import com.project.daisyDonation.beneficiary.dto.NgoDashboardResponse;
import com.project.daisyDonation.beneficiary.entity.Beneficiary;
import com.project.daisyDonation.beneficiary.entity.BeneficiaryStatus;
import com.project.daisyDonation.beneficiary.entity.BeneficiaryType;
import com.project.daisyDonation.beneficiary.entity.ImpactRecord;
import com.project.daisyDonation.beneficiary.repository.BeneficiaryRepository;
import com.project.daisyDonation.beneficiary.repository.ImpactRecordRepository;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.common.service.VerticalAccess;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.program.entity.Program;
import com.project.daisyDonation.program.service.ProgramService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final ImpactRecordRepository impactRecordRepository;
    private final ProgramService programService;
    private final TenantSupport tenantSupport;

    @Transactional
    public BeneficiaryResponse create(UserPrincipal principal, BeneficiaryRequest request) {
        Organization organization = tenantSupport.organization(principal);
        validateBeneficiaryAccess(organization, request.getBeneficiaryType());

        if (beneficiaryRepository.existsByOrganizationIdAndCodeAndDeletedFalse(
                organization.getId(), request.getCode())) {
            throw new ConflictException("Beneficiary code already exists");
        }

        Beneficiary beneficiary = new Beneficiary();
        beneficiary.setOrganization(organization);
        applyRequest(beneficiary, request);
        return toResponse(beneficiaryRepository.save(beneficiary));
    }

    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> list(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        validateBeneficiaryListAccess(organization);

        return beneficiaryRepository.findByOrganizationIdAndDeletedFalse(organization.getId()).stream()
                .filter(b -> matchesOrganizationScope(organization, b))
                .sorted(Comparator.comparing(Beneficiary::getLastName).thenComparing(Beneficiary::getFirstName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BeneficiaryResponse getById(UserPrincipal principal, Long beneficiaryId) {
        return toResponse(requireBeneficiary(principal, beneficiaryId));
    }

    @Transactional
    public BeneficiaryResponse update(UserPrincipal principal, Long beneficiaryId, BeneficiaryRequest request) {
        Beneficiary beneficiary = requireBeneficiary(principal, beneficiaryId);
        validateBeneficiaryAccess(beneficiary.getOrganization(), request.getBeneficiaryType());

        if (!beneficiary.getCode().equals(request.getCode())
                && beneficiaryRepository.existsByOrganizationIdAndCodeAndDeletedFalse(
                        beneficiary.getOrganization().getId(), request.getCode())) {
            throw new ConflictException("Beneficiary code already exists");
        }

        applyRequest(beneficiary, request);
        return toResponse(beneficiaryRepository.save(beneficiary));
    }

    @Transactional
    public ImpactRecordResponse recordImpact(UserPrincipal principal, ImpactRecordRequest request) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireNgo(organization);

        ImpactRecord record = new ImpactRecord();
        record.setOrganization(organization);
        record.setTitle(request.getTitle());
        record.setDescription(request.getDescription());
        record.setRecordedDate(request.getRecordedDate());
        record.setOutcomeMetric(request.getOutcomeMetric());
        record.setOutcomeValue(request.getOutcomeValue());

        if (request.getBeneficiaryId() != null) {
            record.setBeneficiary(requireBeneficiary(principal, request.getBeneficiaryId()));
        }

        if (request.getProgramId() != null) {
            Program program = programService.requireProgram(principal, request.getProgramId());
            record.setProgram(program);
        }

        return toImpactResponse(impactRecordRepository.save(record));
    }

    @Transactional(readOnly = true)
    public List<ImpactRecordResponse> listImpact(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireNgo(organization);

        return impactRecordRepository.findByOrganizationIdAndDeletedFalseOrderByRecordedDateDesc(organization.getId())
                .stream()
                .map(this::toImpactResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ImpactRecordResponse> listImpactForBeneficiary(UserPrincipal principal, Long beneficiaryId) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireNgo(organization);
        requireBeneficiary(principal, beneficiaryId);

        return impactRecordRepository
                .findByBeneficiaryIdAndOrganizationIdAndDeletedFalseOrderByRecordedDateDesc(
                        beneficiaryId, organization.getId())
                .stream()
                .map(this::toImpactResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public NgoDashboardResponse dashboard(UserPrincipal principal) {
        Organization organization = tenantSupport.organization(principal);
        VerticalAccess.requireNgo(organization);

        long active = beneficiaryRepository.findByOrganizationIdAndDeletedFalse(organization.getId()).stream()
                .filter(b -> b.getStatus() == BeneficiaryStatus.ACTIVE)
                .count();

        return NgoDashboardResponse.builder()
                .beneficiaryCount(beneficiaryRepository.countByOrganizationIdAndDeletedFalse(organization.getId()))
                .impactRecordCount(impactRecordRepository.countByOrganizationIdAndDeletedFalse(organization.getId()))
                .activeBeneficiaryCount(active)
                .build();
    }

    public Beneficiary requireBeneficiary(UserPrincipal principal, Long beneficiaryId) {
        Organization organization = tenantSupport.organization(principal);
        Beneficiary beneficiary = beneficiaryRepository
                .findByIdAndOrganizationIdAndDeletedFalse(beneficiaryId, organization.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));
        if (!matchesOrganizationScope(organization, beneficiary)) {
            throw new ResourceNotFoundException("Beneficiary not found");
        }
        return beneficiary;
    }

    private void validateBeneficiaryAccess(Organization organization, BeneficiaryType type) {
        if (VerticalAccess.isNgo(organization)) {
            return;
        }
        if (VerticalAccess.isSchool(organization) && type == BeneficiaryType.STUDENT) {
            return;
        }
        throw new com.project.daisyDonation.common.exception.BadRequestException(
                "Beneficiary management is not available for this organization type");
    }

    private void validateBeneficiaryListAccess(Organization organization) {
        if (VerticalAccess.isNgo(organization) || VerticalAccess.isSchool(organization)) {
            return;
        }
        throw new com.project.daisyDonation.common.exception.BadRequestException(
                "Beneficiary management is not available for this organization type");
    }

    private boolean matchesOrganizationScope(Organization organization, Beneficiary beneficiary) {
        if (VerticalAccess.isNgo(organization)) {
            return true;
        }
        if (VerticalAccess.isSchool(organization)) {
            return beneficiary.getBeneficiaryType() == BeneficiaryType.STUDENT;
        }
        return false;
    }

    private void applyRequest(Beneficiary beneficiary, BeneficiaryRequest request) {
        beneficiary.setFirstName(request.getFirstName());
        beneficiary.setLastName(request.getLastName());
        beneficiary.setCode(request.getCode());
        beneficiary.setBeneficiaryType(request.getBeneficiaryType());
        beneficiary.setStatus(request.getStatus());
        beneficiary.setEnrollmentDate(request.getEnrollmentDate());
        beneficiary.setNotes(request.getNotes());
    }

    private BeneficiaryResponse toResponse(Beneficiary beneficiary) {
        return BeneficiaryResponse.builder()
                .id(beneficiary.getId())
                .firstName(beneficiary.getFirstName())
                .lastName(beneficiary.getLastName())
                .code(beneficiary.getCode())
                .beneficiaryType(beneficiary.getBeneficiaryType())
                .status(beneficiary.getStatus())
                .enrollmentDate(beneficiary.getEnrollmentDate())
                .notes(beneficiary.getNotes())
                .createdAt(beneficiary.getCreatedAt())
                .build();
    }

    private ImpactRecordResponse toImpactResponse(ImpactRecord record) {
        return ImpactRecordResponse.builder()
                .id(record.getId())
                .beneficiaryId(record.getBeneficiary() != null ? record.getBeneficiary().getId() : null)
                .beneficiaryName(record.getBeneficiary() != null
                        ? record.getBeneficiary().getFirstName() + " " + record.getBeneficiary().getLastName()
                        : null)
                .programId(record.getProgram() != null ? record.getProgram().getId() : null)
                .programName(record.getProgram() != null ? record.getProgram().getName() : null)
                .title(record.getTitle())
                .description(record.getDescription())
                .recordedDate(record.getRecordedDate())
                .outcomeMetric(record.getOutcomeMetric())
                .outcomeValue(record.getOutcomeValue())
                .createdAt(record.getCreatedAt())
                .build();
    }
}
