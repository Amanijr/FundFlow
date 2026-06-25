-- Phase 9: Organization-specific modules

CREATE TABLE ministry (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    name             VARCHAR(255)   NOT NULL,
    code             VARCHAR(50)    NOT NULL,
    description      VARCHAR(2000),
    leader_name      VARCHAR(255),
    active           BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_ministry_org_code UNIQUE (organization_id, code)
);

CREATE INDEX idx_ministry_organization_id ON ministry (organization_id);

CREATE TABLE attendance_record (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    ministry_id      BIGINT         REFERENCES ministry (id),
    service_date     DATE           NOT NULL,
    event_name       VARCHAR(255)   NOT NULL,
    attendance_count INT            NOT NULL,
    notes            VARCHAR(1000),
    recorded_by_user_id BIGINT,
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_attendance_record_organization_id ON attendance_record (organization_id);
CREATE INDEX idx_attendance_record_ministry_id ON attendance_record (ministry_id);
CREATE INDEX idx_attendance_record_service_date ON attendance_record (service_date);

CREATE TABLE beneficiary (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    first_name       VARCHAR(50)    NOT NULL,
    last_name        VARCHAR(50)    NOT NULL,
    code             VARCHAR(50)    NOT NULL,
    beneficiary_type VARCHAR(50)    NOT NULL DEFAULT 'GENERAL',
    status           VARCHAR(50)    NOT NULL DEFAULT 'ACTIVE',
    enrollment_date  DATE,
    notes            VARCHAR(2000),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_beneficiary_org_code UNIQUE (organization_id, code)
);

CREATE INDEX idx_beneficiary_organization_id ON beneficiary (organization_id);
CREATE INDEX idx_beneficiary_type ON beneficiary (beneficiary_type);

CREATE TABLE impact_record (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    beneficiary_id   BIGINT         REFERENCES beneficiary (id),
    program_id       BIGINT         REFERENCES program (id),
    title            VARCHAR(255)   NOT NULL,
    description      VARCHAR(2000),
    recorded_date    DATE           NOT NULL,
    outcome_metric   VARCHAR(255),
    outcome_value    VARCHAR(255),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_impact_record_organization_id ON impact_record (organization_id);
CREATE INDEX idx_impact_record_beneficiary_id ON impact_record (beneficiary_id);

CREATE TABLE student_sponsorship (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    beneficiary_id   BIGINT         NOT NULL REFERENCES beneficiary (id),
    donor_id         BIGINT         NOT NULL REFERENCES donor (id),
    academic_year    VARCHAR(20)    NOT NULL,
    term             VARCHAR(50),
    amount           NUMERIC(19, 2) NOT NULL,
    status           VARCHAR(50)    NOT NULL DEFAULT 'ACTIVE',
    start_date       DATE,
    end_date         DATE,
    notes            VARCHAR(1000),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_student_sponsorship_organization_id ON student_sponsorship (organization_id);
CREATE INDEX idx_student_sponsorship_beneficiary_id ON student_sponsorship (beneficiary_id);
CREATE INDEX idx_student_sponsorship_donor_id ON student_sponsorship (donor_id);
