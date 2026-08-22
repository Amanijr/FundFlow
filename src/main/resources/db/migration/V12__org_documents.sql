-- Phase: document attachments (receipts, invoices, supporting files)

CREATE TABLE org_document (
    id                    BIGSERIAL PRIMARY KEY,
    organization_id       BIGINT       NOT NULL REFERENCES organizations (id),
    entity_type           VARCHAR(50)  NOT NULL,
    entity_id             BIGINT,
    name                  VARCHAR(255) NOT NULL,
    category              VARCHAR(50)  NOT NULL DEFAULT 'other',
    mime_type             VARCHAR(255) NOT NULL,
    size_bytes            BIGINT       NOT NULL,
    version               INTEGER      NOT NULL DEFAULT 1,
    status                VARCHAR(50)  NOT NULL DEFAULT 'ready',
    uploaded_by_user_id   BIGINT       REFERENCES users (id),
    change_notes          VARCHAR(1000),
    tags                  VARCHAR(1000),
    created_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted               BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_org_document_org ON org_document (organization_id);
CREATE INDEX idx_org_document_entity ON org_document (organization_id, entity_type, entity_id);

CREATE TABLE org_document_content (
    document_id BIGINT PRIMARY KEY REFERENCES org_document (id) ON DELETE CASCADE,
    content     BYTEA NOT NULL
);
