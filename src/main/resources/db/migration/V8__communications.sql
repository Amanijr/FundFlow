-- Phase 8: Communications

CREATE TABLE communication_log (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    channel          VARCHAR(50)    NOT NULL,
    message_type     VARCHAR(50)    NOT NULL,
    recipient        VARCHAR(255)   NOT NULL,
    subject          VARCHAR(500),
    body             VARCHAR(4000)  NOT NULL,
    status           VARCHAR(50)    NOT NULL DEFAULT 'PENDING',
    reference_type   VARCHAR(50),
    reference_id     BIGINT,
    sent_at          TIMESTAMP,
    failure_reason   VARCHAR(1000),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_communication_log_organization_id ON communication_log (organization_id);
CREATE INDEX idx_communication_log_channel ON communication_log (channel);
CREATE INDEX idx_communication_log_status ON communication_log (status);
CREATE INDEX idx_communication_log_reference ON communication_log (reference_type, reference_id);
