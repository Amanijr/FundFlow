package com.project.daisyDonation.fund.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.project.daisyDonation.common.exception.ResourceNotFoundException;
import com.project.daisyDonation.expense.repository.ExpenseRepository;
import com.project.daisyDonation.fund.entity.Fund;
import com.project.daisyDonation.fund.repository.FundRepository;
import com.project.daisyDonation.fund.repository.FundTransferRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FundBalanceService {

    private final FundRepository fundRepository;
    private final FundTransferRepository fundTransferRepository;
    private final ExpenseRepository expenseRepository;

    @Transactional(readOnly = true)
    public BigDecimal calculateBalance(Long fundId, Long organizationId) {
        Fund fund = fundRepository.findByIdAndOrganizationIdAndDeletedFalse(fundId, organizationId)
                .orElseThrow(() -> new ResourceNotFoundException("Fund not found"));

        BigDecimal incoming = fundTransferRepository.sumIncomingTransfers(fundId, organizationId);
        BigDecimal outgoing = fundTransferRepository.sumOutgoingTransfers(fundId, organizationId);
        BigDecimal expenses = expenseRepository.sumPaidAmountByFund(fundId, organizationId);

        return fund.getOpeningBalance()
                .add(incoming)
                .subtract(outgoing)
                .subtract(expenses);
    }

    @Transactional(readOnly = true)
    public void ensureSufficientBalance(Long fundId, Long organizationId, BigDecimal amount) {
        BigDecimal balance = calculateBalance(fundId, organizationId);
        if (balance.compareTo(amount) < 0) {
            throw new com.project.daisyDonation.common.exception.BadRequestException(
                    "Insufficient fund balance. Available: " + balance);
        }
    }
}
