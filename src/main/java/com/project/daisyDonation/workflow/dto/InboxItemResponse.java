package com.project.daisyDonation.workflow.dto;

import java.math.BigDecimal;
import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InboxItemResponse {

    private String id;
    private String workflowInstanceId;
    private String title;
    private String summary;
    private String module;
    private String entityType;
    private Long entityId;
    private InboxRequestorResponse requestor;
    private Instant submittedAt;
    private String currentStage;
    private String currentStageLabel;
    private String status;
    private String priority;
    private Instant slaDueAt;
    private boolean slaBreached;
    private String slaStatus;
    private boolean actionRequired;
    private String href;
    private BigDecimal amount;
    private String currency;
}
