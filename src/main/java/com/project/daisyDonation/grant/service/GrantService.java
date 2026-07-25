package com.project.daisyDonation.grant.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.expense.repository.ExpenseRepository;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.fund.service.FundService;
import com.project.daisyDonation.grant.dto.GrantComplianceRequest;
import com.project.daisyDonation.grant.dto.GrantRequest;
import com.project.daisyDonation.grant.dto.GrantResponse;
import com.project.daisyDonation.grant.dto.GrantUtilizationResponse;
import com.project.daisyDonation.grant.entity.Grant;
import com.project.daisyDonation.grant.entity.GrantComplianceStatus;
import com.project.daisyDonation.grant.entity.GrantRestrictionType;
import com.project.daisyDonation.grant.entity.GrantStatus;
import com.project.daisyDonation.grant.repository.GrantRepository;
import com.project.daisyDonation.organization.entity.Organization;
import com.project.daisyDonation.program.entity.Program;
import com.project.daisyDonation.program.service.ProgramService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GrantService {

    private static final long EXPIRY_WARNING_DAYS = 30;
    private static final BigDecimal AT_RISK_THRESHOLD = new BigDecimal("90");

    private final GrantRepository grantRepository;
    private final ExpenseRepository expenseRepository;
    private final TenantSupport tenantSupport;
    private final FundService fundService;
    private final ProgramService programService;

    @Transactional
    public GrantResponse create(UserPrincipal principal, GrantRequest request) {
        Organization organization = tenantSupport.organization(principal);
        validateGrantRequest(request);

        if (grantRepository.existsByOrganizationIdAndGrantCodeAndDeletedFalse(
                organization.getId(), request.getGrantCode())) {
            throw new ConflictException("Grant code already exists in this organization");
        }

        Grant grant = new Grant();
        grant.setOrganization(organization);
        applyRequest(principal, grant, request);

        return toResponse(grantRepository.save(grant));
    }

    @Transactional(readOnly = true)
    public List<GrantResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return grantRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(Grant::getName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public GrantResponse getById(UserPrincipal principal, Long grantId) {
        return toResponse(requireGrant(principal, grantId));
    }

    @Transactional
    public GrantResponse update(UserPrincipal principal, Long grantId, GrantRequest request) {
        Grant grant = requireGrant(principal, grantId);
        ensureDraft(grant);
        validateGrantRequest(request);

        if (!grant.getGrantCode().equals(request.getGrantCode())
                && grantRepository.existsByOrganizationIdAndGrantCodeAndDeletedFalse(
                        grant.getOrganization().getId(), request.getGrantCode())) {
            throw new ConflictException("Grant code already exists in this organization");
        }

        applyRequest(principal, grant, request);
        return toResponse(grantRepository.save(grant));
    }

    @Transactional
    public GrantResponse activate(UserPrincipal principal, Long grantId) {
        Grant grant = requireGrant(principal, grantId);

        if (grant.getStatus() != GrantStatus.DRAFT) {
            throw new BadRequestException("Only draft grants can be activated");
        }

        if (grant.getEndDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot activate a grant that has already expired");
        }

        grant.setStatus(GrantStatus.ACTIVE);
        grant.setComplianceStatus(evaluateCompliance(grant));
        return toResponse(grantRepository.save(grant));
    }

    @Transactional
    public GrantResponse close(UserPrincipal principal, Long grantId) {
        Grant grant = requireGrant(principal, grantId);

        if (grant.getStatus() != GrantStatus.ACTIVE) {
            throw new BadRequestException("Only active grants can be closed");
        }

        grant.setStatus(GrantStatus.CLOSED);
        grant.setComplianceStatus(evaluateCompliance(grant));
        return toResponse(grantRepository.save(grant));
    }

    @Transactional
    public GrantResponse recordCompliance(UserPrincipal principal, Long grantId, GrantComplianceRequest request) {
        Grant grant = requireGrant(principal, grantId);
        grant.setComplianceNotes(request.getComplianceNotes());
        grant.setComplianceStatus(evaluateCompliance(grant));
        return toResponse(grantRepository.save(grant));
    }

    @Transactional
    public GrantUtilizationResponse getUtilization(UserPrincipal principal, Long grantId) {
        Grant grant = requireGrant(principal, grantId);
        Long organizationId = grant.getOrganization().getId();

        BigDecimal spent = expenseRepository.sumPaidAmountByGrant(grantId, organizationId);
        BigDecimal remaining = grant.getAwardedAmount().subtract(spent);
        BigDecimal usagePercent = percent(spent, grant.getAwardedAmount());
        long daysToExpiry = ChronoUnit.DAYS.between(LocalDate.now(), grant.getEndDate());
        boolean expiringSoon = grant.getStatus() == GrantStatus.ACTIVE
                && daysToExpiry >= 0
                && daysToExpiry <= EXPIRY_WARNING_DAYS;

        if (grant.getStatus() == GrantStatus.ACTIVE
                && grant.getEndDate().isBefore(LocalDate.now())) {
            grant.setStatus(GrantStatus.EXPIRED);
        }

        GrantComplianceStatus compliance = evaluateCompliance(grant);
        if (grant.getComplianceStatus() != compliance) {
            grant.setComplianceStatus(compliance);
            grantRepository.save(grant);
        }

        return GrantUtilizationResponse.builder()
                .grantId(grant.getId())
                .grantName(grant.getName())
                .grantCode(grant.getGrantCode())
                .status(grant.getStatus())
                .complianceStatus(grant.getComplianceStatus())
                .awardedAmount(grant.getAwardedAmount())
                .spentAmount(spent)
                .remainingBalance(remaining)
                .usagePercent(usagePercent)
                .endDate(grant.getEndDate())
                .daysToExpiry(daysToExpiry)
                .expiringSoon(expiringSoon)
                .build();
    }

    public Grant requireGrant(UserPrincipal principal, Long grantId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return grantRepository.findByIdAndOrganizationIdAndDeletedFalse(grantId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Grant not found"));
    }

    private GrantComplianceStatus evaluateCompliance(Grant grant) {
        Long organizationId = grant.getOrganization().getId();
        BigDecimal spent = expenseRepository.sumPaidAmountByGrant(grant.getId(), organizationId);

        if (spent.compareTo(grant.getAwardedAmount()) > 0) {
            return GrantComplianceStatus.NON_COMPLIANT;
        }

        if (grant.getRestrictionType() == GrantRestrictionType.TIME_RESTRICTED
                || grant.getRestrictionType() == GrantRestrictionType.FULLY_RESTRICTED) {
            if (grant.getEndDate().isBefore(LocalDate.now()) && spent.compareTo(BigDecimal.ZERO) > 0) {
                return GrantComplianceStatus.AT_RISK;
            }
        }

        if (grant.getStatus() == GrantStatus.DRAFT) {
            return GrantComplianceStatus.PENDING;
        }

        BigDecimal usagePercent = percent(spent, grant.getAwardedAmount());
        if (usagePercent.compareTo(AT_RISK_THRESHOLD) >= 0) {
            return GrantComplianceStatus.AT_RISK;
        }

        return GrantComplianceStatus.COMPLIANT;
    }

    private void validateGrantRequest(GrantRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date must be on or after start date");
        }
    }

    private void ensureDraft(Grant grant) {
        if (grant.getStatus() != GrantStatus.DRAFT) {
            throw new BadRequestException("Only draft grants can be modified");
        }
    }

    private void applyRequest(UserPrincipal principal, Grant grant, GrantRequest request) {
        grant.setName(request.getName());
        grant.setGrantCode(request.getGrantCode());
        grant.setFunderName(request.getFunderName());
        grant.setAwardedAmount(request.getAwardedAmount());
        grant.setStartDate(request.getStartDate());
        grant.setEndDate(request.getEndDate());
        grant.setRestrictionType(request.getRestrictionType());
        grant.setRestrictionNotes(request.getRestrictionNotes());

        if (request.getProgramId() != null) {
            Program program = programService.requireProgram(principal, request.getProgramId());
            grant.setProgram(program);
        } else {
            grant.setProgram(null);
        }

        if (request.getFundId() != null) {
            Fund fund = fundService.requireFund(principal, request.getFundId());
            grant.setFund(fund);
        } else {
            grant.setFund(null);
        }
    }

    private GrantResponse toResponse(Grant grant) {
        return GrantResponse.builder()
                .id(grant.getId())
                .name(grant.getName())
                .grantCode(grant.getGrantCode())
                .funderName(grant.getFunderName())
                .awardedAmount(grant.getAwardedAmount())
                .startDate(grant.getStartDate())
                .endDate(grant.getEndDate())
                .status(grant.getStatus())
                .restrictionType(grant.getRestrictionType())
                .restrictionNotes(grant.getRestrictionNotes())
                .complianceStatus(grant.getComplianceStatus())
                .complianceNotes(grant.getComplianceNotes())
                .programId(grant.getProgram() != null ? grant.getProgram().getId() : null)
                .programName(grant.getProgram() != null ? grant.getProgram().getName() : null)
                .fundId(grant.getFund() != null ? grant.getFund().getId() : null)
                .fundName(grant.getFund() != null ? grant.getFund().getName() : null)
                .createdAt(grant.getCreatedAt())
                .build();
    }

    private BigDecimal percent(BigDecimal part, BigDecimal whole) {
        if (whole == null || whole.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return part.multiply(BigDecimal.valueOf(100)).divide(whole, 2, RoundingMode.HALF_UP);
    }
}
