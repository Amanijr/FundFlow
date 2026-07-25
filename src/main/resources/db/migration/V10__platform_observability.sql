-- Phase 10: Platform observability (system logs, alerts, errors)

CREATE TABLE system_log (
    id               BIGSERIAL PRIMARY KEY,
    log_type         VARCHAR(50)  NOT NULL,
    severity         VARCHAR(20)  NOT NULL,
    category         VARCHAR(100) NOT NULL,
    message          VARCHAR(2000) NOT NULL,
    details          TEXT,
    organization_id  BIGINT       REFERENCES organizations (id),
    user_id          BIGINT,
    user_email       VARCHAR(100),
    request_method   VARCHAR(10),
    request_path     VARCHAR(500),
    http_status      INT,
    exception_type   VARCHAR(255),
    stack_trace      TEXT,
    alert_resolved   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_log_created_at ON system_log (created_at DESC);
CREATE INDEX idx_system_log_log_type ON system_log (log_type);
CREATE INDEX idx_system_log_severity ON system_log (severity);
CREATE INDEX idx_system_log_category ON system_log (category);
CREATE INDEX idx_system_log_organization_id ON system_log (organization_id);
CREATE INDEX idx_system_log_alert_resolved ON system_log (alert_resolved) WHERE log_type = 'ALERT';
