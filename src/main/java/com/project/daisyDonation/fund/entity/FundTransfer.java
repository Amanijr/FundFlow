package com.project.daisyDonation.fund.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.common.entity.TenantEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "fund_transfer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FundTransfer extends TenantEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "from_fund_id", nullable = false)
    private Fund fromFund;

    @ManyToOne(optional = false)
    @JoinColumn(name = "to_fund_id", nullable = false)
    private Fund toFund;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(length = 500)
    private String reason;

    @Column(name = "transferred_at", nullable = false)
    private LocalDateTime transferredAt;

    @Column(name = "transferred_by_user_id")
    private Long transferredByUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FundTransferStatus status = FundTransferStatus.COMPLETED;
}
