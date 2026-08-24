package com.project.daisyDonation.workflow.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboxListResponse {

    private List<InboxItemResponse> items;
    private int page;
    private int totalPages;
    private long totalElements;
}
