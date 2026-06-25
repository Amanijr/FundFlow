package com.project.daisyDonation.accounting.entity;

import java.math.BigDecimal;

import com.project.daisyDonation.common.entity.Abstract;
import com.project.daisyDonation.fund.entity.Fund;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "journal_line")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JournalLine extends Abstract {

    @ManyToOne(optional = false)
    @JoinColumn(name = "journal_entry_id", nullable = false)
    private JournalEntry journalEntry;

    @ManyToOne(optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private ChartOfAccount account;

    @ManyToOne
    @JoinColumn(name = "fund_id")
    private Fund fund;

    @Column(name = "debit_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal debitAmount = BigDecimal.ZERO;

    @Column(name = "credit_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal creditAmount = BigDecimal.ZERO;

    @Column(name = "line_description", length = 500)
    private String lineDescription;
}
