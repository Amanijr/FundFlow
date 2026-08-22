package com.project.daisyDonation.document.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentVersionResponse {
    private int version;
    private String documentId;
    private String name;
    private long sizeBytes;
    private String mimeType;
    private DocumentUploadedByResponse uploadedBy;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime uploadedAt;
    private String changeNotes;
    @JsonProperty("isCurrent")
    private boolean current;
}
