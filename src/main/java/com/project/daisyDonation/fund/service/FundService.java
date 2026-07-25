package com.project.daisyDonation.fund.service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.exception.ConflictException;
import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.common.service.TenantSupport;
import com.project.daisyDonation.fund.dto.FundRequest;
import com.project.daisyDonation.fund.dto.FundResponse;
import com.project.daisyDonation.fund.dto.FundTransferRequest;
import com.project.daisyDonation.fund.dto.FundTransferResponse;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.fund.entity.FundTransfer;
import com.project.daisyDonation.fund.entity.FundTransferStatus;
import com.project.daisyDonation.fund.repository.FundRepository;
import com.project.daisyDonation.fund.repository.FundTransferRepository;
import com.project.daisyDonation.organization.entity.Organization;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FundService {

    private final FundRepository fundRepository;
    private final FundTransferRepository fundTransferRepository;
    private final FundBalanceService fundBalanceService;
    private final TenantSupport tenantSupport;

    @Transactional
    public FundResponse create(UserPrincipal principal, FundRequest request) {
        Organization organization = tenantSupport.organization(principal);

        if (fundRepository.existsByOrganizationIdAndCodeAndDeletedFalse(organization.getId(), request.getCode())) {
            throw new ConflictException("Fund code already exists in this organization");
        }

        Fund fund = new Fund();
        fund.setOrganization(organization);
        applyRequest(fund, request);
        if (request.getOpeningBalance() != null) {
            fund.setOpeningBalance(request.getOpeningBalance());
        }

        return toResponse(fundRepository.save(fund));
    }

    @Transactional(readOnly = true)
    public List<FundResponse> list(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return fundRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(Fund::getName))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public FundResponse getById(UserPrincipal principal, Long fundId) {
        return toResponse(requireFund(principal, fundId));
    }

    @Transactional
    public FundResponse update(UserPrincipal principal, Long fundId, FundRequest request) {
        Fund fund = requireFund(principal, fundId);

        if (!fund.getCode().equals(request.getCode())
                && fundRepository.existsByOrganizationIdAndCodeAndDeletedFalse(
                        fund.getOrganization().getId(), request.getCode())) {
            throw new ConflictException("Fund code already exists in this organization");
        }

        applyRequest(fund, request);
        if (request.getOpeningBalance() != null) {
            fund.setOpeningBalance(request.getOpeningBalance());
        }

        return toResponse(fundRepository.save(fund));
    }

    @Transactional
    public FundTransferResponse transfer(UserPrincipal principal, FundTransferRequest request) {
        if (request.getFromFundId().equals(request.getToFundId())) {
            throw new BadRequestException("Cannot transfer to the same fund");
        }

        Fund fromFund = requireFund(principal, request.getFromFundId());
        Fund toFund = requireFund(principal, request.getToFundId());

        fundBalanceService.ensureSufficientBalance(
                fromFund.getId(), fromFund.getOrganization().getId(), request.getAmount());

        FundTransfer transfer = new FundTransfer();
        transfer.setOrganization(fromFund.getOrganization());
        transfer.setFromFund(fromFund);
        transfer.setToFund(toFund);
        transfer.setAmount(request.getAmount());
        transfer.setReason(request.getReason());
        transfer.setTransferredAt(request.getTransferredAt());
        transfer.setTransferredByUserId(principal.getId());
        transfer.setStatus(FundTransferStatus.COMPLETED);

        return toTransferResponse(fundTransferRepository.save(transfer));
    }

    @Transactional(readOnly = true)
    public List<FundTransferResponse> listTransfers(UserPrincipal principal) {
        Long organizationId = tenantSupport.organizationId(principal);
        return fundTransferRepository.findByOrganizationIdAndDeletedFalse(organizationId).stream()
                .sorted(Comparator.comparing(FundTransfer::getTransferredAt).reversed())
                .map(this::toTransferResponse)
                .toList();
    }

    public Fund requireFund(UserPrincipal principal, Long fundId) {
        Long organizationId = tenantSupport.organizationId(principal);
        return fundRepository.findByIdAndOrganizationIdAndDeletedFalse(fundId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Fund not found"));
    }

    private void applyRequest(Fund fund, FundRequest request) {
        fund.setName(request.getName());
        fund.setCode(request.getCode());
        fund.setType(request.getType());
        fund.setDescription(request.getDescription());
        fund.setActive(request.isActive());
    }

    private FundResponse toResponse(Fund fund) {
        BigDecimal currentBalance = fundBalanceService.calculateBalance(
                fund.getId(), fund.getOrganization().getId());

        return FundResponse.builder()
                .id(fund.getId())
                .organizationId(fund.getOrganization().getId())
                .name(fund.getName())
                .code(fund.getCode())
                .type(fund.getType())
                .description(fund.getDescription())
                .openingBalance(fund.getOpeningBalance())
                .currentBalance(currentBalance)
                .active(fund.isActive())
                .createdAt(fund.getCreatedAt())
                .build();
    }

    private FundTransferResponse toTransferResponse(FundTransfer transfer) {
        return FundTransferResponse.builder()
                .id(transfer.getId())
                .organizationId(transfer.getOrganization().getId())
                .fromFundId(transfer.getFromFund().getId())
                .fromFundName(transfer.getFromFund().getName())
                .toFundId(transfer.getToFund().getId())
                .toFundName(transfer.getToFund().getName())
                .amount(transfer.getAmount())
                .reason(transfer.getReason())
                .transferredAt(transfer.getTransferredAt())
                .transferredByUserId(transfer.getTransferredByUserId())
                .status(transfer.getStatus())
                .build();
    }
}
