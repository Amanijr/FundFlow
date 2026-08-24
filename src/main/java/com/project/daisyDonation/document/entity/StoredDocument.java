package com.project.daisyDonation.document.entity;

import com.project.daisyDonation.common.entity.TenantEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "org_document")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StoredDocument extends TenantEntity {

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 50)
    private String category = "other";

    @Column(name = "mime_type", nullable = false, length = 255)
    private String mimeType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(nullable = false)
    private int version = 1;

    @Column(nullable = false, length = 50)
    private String status = "ready";

    @Column(name = "uploaded_by_user_id")
    private Long uploadedByUserId;

    @Column(name = "change_notes", length = 1000)
    private String changeNotes;

    @Column(length = 1000)
    private String tags;
}
