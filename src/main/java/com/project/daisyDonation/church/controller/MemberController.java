package com.project.daisyDonation.church.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.daisyDonation.church.dto.MemberDetailResponse;
import com.project.daisyDonation.church.dto.MemberMinistryResponse;
import com.project.daisyDonation.church.dto.MemberRequest;
import com.project.daisyDonation.church.dto.MemberResponse;
import com.project.daisyDonation.church.dto.PartnershipResponse;
import com.project.daisyDonation.church.service.MemberMinistryService;
import com.project.daisyDonation.church.service.MemberService;
import com.project.daisyDonation.church.service.PartnershipService;
import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.security.UserPrincipal;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
@Tag(name = "Members", description = "Church congregation members. Separate from fundraising donors.")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class MemberController {

    private final MemberService memberService;
    private final MemberMinistryService memberMinistryService;
    private final PartnershipService partnershipService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','FINANCE_MANAGER','STAFF')")
    @Operation(summary = "Create member", description = "Creates a church member record.")
    public ResponseEntity<ApiResponse<MemberResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Member created", memberService.create(principal, request)));
    }

    @GetMapping
    @Operation(summary = "List members", description = "Returns church members for the authenticated organization.")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.list(principal)));
    }

    @GetMapping("/{id}/ministries")
    @Operation(summary = "List member ministries", description = "Church departments this member belongs to.")
    public ResponseEntity<ApiResponse<List<MemberMinistryResponse>>> listMinistries(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(memberMinistryService.listForMember(principal, id)));
    }

    @GetMapping("/{id}/partnerships")
    @Operation(summary = "List member partnerships", description = "Monthly partnership offerings for this member.")
    public ResponseEntity<ApiResponse<List<PartnershipResponse>>> listPartnerships(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        memberService.requireMember(principal, id);
        return ResponseEntity.ok(ApiResponse.ok(partnershipService.list(principal, id)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get member by id")
    public ResponseEntity<ApiResponse<MemberDetailResponse>> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Unique member identifier")
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(memberService.getById(principal, id)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER','FINANCE_MANAGER','STAFF')")
    @Operation(summary = "Update member")
    public ResponseEntity<ApiResponse<MemberResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody MemberRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Member updated", memberService.update(principal, id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORG_ADMIN','FUNDRAISING_MANAGER')")
    @Operation(summary = "Delete member")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        memberService.delete(principal, id);
        return ResponseEntity.ok(ApiResponse.ok("Member deleted", null));
    }
}
