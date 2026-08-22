package com.project.daisyDonation.document.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentMetadataUpdateRequest {
    private String name;
    private String category;
    private List<String> tags;
}
