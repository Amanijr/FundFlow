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
public class DocumentListResponse {
    private List<DocumentResponse> items;
    private int page;
    private int totalPages;
    private long totalElements;
}
