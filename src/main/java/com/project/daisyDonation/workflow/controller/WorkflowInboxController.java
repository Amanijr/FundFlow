package com.project.daisyDonation.workflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.workflow.dto.InboxListResponse;
import com.project.daisyDonation.workflow.service.WorkflowInboxService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/workflow")
@RequiredArgsConstructor
@Tag(name = "Workflow", description = "Approval inbox backed by submitted expenses")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class WorkflowInboxController {

    private final WorkflowInboxService workflowInboxService;

    @GetMapping("/inbox/count")
    @Operation(summary = "Count items requiring action")
    public ResponseEntity<ApiResponse<Long>> count(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(workflowInboxService.count(principal)));
    }

    @GetMapping("/inbox")
    @Operation(summary = "List workflow inbox")
    public ResponseEntity<ApiResponse<InboxListResponse>> inbox(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        return ResponseEntity.ok(ApiResponse.ok(
                workflowInboxService.list(principal, status, entityType, q, sort, page, size)));
    }
}
