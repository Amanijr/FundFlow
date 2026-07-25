package com.project.daisyDonation.collection.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.project.daisyDonation.collection.entity.CollectionSessionStatus;
import com.project.daisyDonation.collection.entity.CollectionType;
import com.project.daisyDonation.payment.entity.PaymentMethod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response payload for collection session")
public class CollectionSessionResponse {

    private Long id;
    private Long organizationId;
    private CollectionType collectionType;
    private String title;
    private String description;
    private BigDecimal totalAmount;
    private PaymentMethod paymentMethod;
    private LocalDateTime collectedAt;
    private String location;
    private Long collectedByUserId;
    private Long verifiedByUserId;
    private CollectionSessionStatus status;
    private Long campaignId;
    private String campaignName;
    private Long donationId;
    private String notes;
    private LocalDateTime createdAt;
}
