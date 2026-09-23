-- Immutable domain audit trail (not system_log). Used for gift voids and similar staff actions.

CREATE TABLE domain_audit (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    actor_user_id    BIGINT,
    action           VARCHAR(80)    NOT NULL,
    entity_type      VARCHAR(80)    NOT NULL,
    entity_id        BIGINT         NOT NULL,
    details          VARCHAR(2000),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_domain_audit_organization_id ON domain_audit (organization_id);
CREATE INDEX idx_domain_audit_entity ON domain_audit (organization_id, entity_type, entity_id);
