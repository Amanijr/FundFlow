package com.project.daisyDonation.document.controller;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.project.daisyDonation.common.config.OpenApiConfig;
import com.project.daisyDonation.common.dto.ApiResponse;
import com.project.daisyDonation.common.exception.BadRequestException;
import com.project.daisyDonation.common.security.UserPrincipal;
import com.project.daisyDonation.document.dto.DocumentListResponse;
import com.project.daisyDonation.document.dto.DocumentMetadataUpdateRequest;
import com.project.daisyDonation.document.dto.DocumentResponse;
import com.project.daisyDonation.document.dto.DocumentVersionListResponse;
import com.project.daisyDonation.document.service.DocumentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Tag(name = "Documents", description = "Upload and list attachments for gifts, expenses, and other records")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    @Operation(summary = "List documents")
    public ResponseEntity<ApiResponse<DocumentListResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.list(
                principal, entityType, entityId, category, status, q)));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a document")
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file,
            @RequestParam String entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String changeNotes) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(
                        "Uploaded",
                        documentService.upload(principal, file, entityType, entityId, category, tags, changeNotes)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document metadata")
    public ResponseEntity<ApiResponse<DocumentResponse>> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.get(principal, parseId(id))));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update document metadata")
    public ResponseEntity<ApiResponse<DocumentResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestBody DocumentMetadataUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.updateMetadata(principal, parseId(id), request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete document")
    public ResponseEntity<ApiResponse<DocumentResponse>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Deleted", documentService.delete(principal, parseId(id))));
    }

    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive document")
    public ResponseEntity<ApiResponse<DocumentResponse>> archive(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok("Archived", documentService.archive(principal, parseId(id))));
    }

    @GetMapping("/{id}/versions")
    @Operation(summary = "List document versions")
    public ResponseEntity<ApiResponse<DocumentVersionListResponse>> versions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.versions(principal, parseId(id))));
    }

    @PostMapping(value = "/{id}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a new document version")
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadVersion(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String changeNotes) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Version uploaded",
                documentService.uploadVersion(principal, parseId(id), file, changeNotes)));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Download document file")
    public ResponseEntity<byte[]> download(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String id) {
        DocumentService.FileDownload file = documentService.download(principal, parseId(id));
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(file.mimeType());
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(file.name())
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .contentType(mediaType)
                .contentLength(file.content().length)
                .body(file.content());
    }

    private Long parseId(String id) {
        try {
            return Long.valueOf(id);
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Invalid document id");
        }
    }
}
