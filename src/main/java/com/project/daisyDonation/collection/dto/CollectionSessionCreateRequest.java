package com.project.daisyDonation.collection.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

import com.project.daisyDonation.collection.entity.CollectionType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for collection session create")
public class CollectionSessionCreateRequest {
    @Schema(description = "collection type")
    @NotNull
    private CollectionType collectionType;
    @Schema(description = "title")
    @Size(max = 255)
    private String title;
    @Schema(description = "description")
    @Size(max = 1000)
    private String description;
    @Schema(description = "campaign id")
    private Long campaignId;
    @Schema(description = "location")
    @Size(max = 255)
    private String location;
    @Schema(description = "notes")
    @Size(max = 1000)
    private String notes;
}
