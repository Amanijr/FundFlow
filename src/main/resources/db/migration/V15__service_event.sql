-- Service/event is the parent for headcount attendance.

CREATE TABLE service_event (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    ministry_id      BIGINT         REFERENCES ministry (id),
    name             VARCHAR(255)   NOT NULL,
    service_date     DATE           NOT NULL,
    starts_at        TIME,
    location         VARCHAR(255),
    notes            VARCHAR(1000),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_service_event_organization_id ON service_event (organization_id);
CREATE INDEX idx_service_event_service_date ON service_event (organization_id, service_date);

ALTER TABLE service_event ADD COLUMN source_attendance_id BIGINT;

INSERT INTO service_event (
    organization_id, ministry_id, name, service_date, notes, created_at, updated_at, deleted, source_attendance_id
)
SELECT
    organization_id, ministry_id, event_name, service_date, notes, created_at, updated_at, deleted, id
FROM attendance_record;

ALTER TABLE attendance_record ADD COLUMN service_event_id BIGINT;

UPDATE attendance_record ar
SET service_event_id = se.id
FROM service_event se
WHERE se.source_attendance_id = ar.id;

ALTER TABLE service_event DROP COLUMN source_attendance_id;

ALTER TABLE attendance_record
    ADD CONSTRAINT fk_attendance_service_event
        FOREIGN KEY (service_event_id) REFERENCES service_event (id);

CREATE INDEX idx_attendance_record_service_event_id ON attendance_record (service_event_id);
