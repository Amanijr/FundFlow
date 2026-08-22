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
public class DocumentVersionListResponse {
    private String documentId;
    private int currentVersion;
    private List<DocumentVersionResponse> versions;
}
