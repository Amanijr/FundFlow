-- Phase 7: Grants & Programs

CREATE TABLE program (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    name             VARCHAR(255)   NOT NULL,
    code             VARCHAR(50)    NOT NULL,
    description      VARCHAR(2000),
    status           VARCHAR(50)    NOT NULL DEFAULT 'PLANNED',
    start_date       DATE,
    end_date         DATE,
    fund_id          BIGINT         REFERENCES fund (id),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_program_org_code UNIQUE (organization_id, code)
);

CREATE INDEX idx_program_organization_id ON program (organization_id);
CREATE INDEX idx_program_status ON program (status);

CREATE TABLE grant_record (
    id                  BIGSERIAL PRIMARY KEY,
    organization_id     BIGINT         NOT NULL REFERENCES organizations (id),
    name                VARCHAR(255)   NOT NULL,
    grant_code          VARCHAR(50)    NOT NULL,
    funder_name         VARCHAR(255)   NOT NULL,
    awarded_amount      NUMERIC(19, 2) NOT NULL,
    start_date          DATE           NOT NULL,
    end_date            DATE           NOT NULL,
    status              VARCHAR(50)    NOT NULL DEFAULT 'DRAFT',
    restriction_type    VARCHAR(50)    NOT NULL DEFAULT 'FULLY_RESTRICTED',
    restriction_notes   VARCHAR(2000),
    compliance_status   VARCHAR(50)    NOT NULL DEFAULT 'PENDING',
    compliance_notes    VARCHAR(2000),
    program_id          BIGINT         REFERENCES program (id),
    fund_id             BIGINT         REFERENCES fund (id),
    created_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted             BOOLEAN        NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_grant_org_code UNIQUE (organization_id, grant_code)
);

CREATE INDEX idx_grant_record_organization_id ON grant_record (organization_id);
CREATE INDEX idx_grant_record_program_id ON grant_record (program_id);
CREATE INDEX idx_grant_record_fund_id ON grant_record (fund_id);
CREATE INDEX idx_grant_record_status ON grant_record (status);
CREATE INDEX idx_grant_record_end_date ON grant_record (end_date);

ALTER TABLE budget ADD COLUMN program_id BIGINT REFERENCES program (id);
ALTER TABLE expense ADD COLUMN program_id BIGINT REFERENCES program (id);
ALTER TABLE expense ADD COLUMN grant_id BIGINT REFERENCES grant_record (id);

CREATE INDEX idx_budget_program_id ON budget (program_id);
CREATE INDEX idx_expense_program_id ON expense (program_id);
CREATE INDEX idx_expense_grant_id ON expense (grant_id);
