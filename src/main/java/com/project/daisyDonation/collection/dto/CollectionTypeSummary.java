package com.project.daisyDonation.collection.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

import com.project.daisyDonation.collection.entity.CollectionType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Collection Type Summary")
public class CollectionTypeSummary {

    private CollectionType collectionType;
    private BigDecimal totalVerifiedAmount;
    private long verifiedSessionCount;
}
