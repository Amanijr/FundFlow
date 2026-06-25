-- Phase 4: Double-entry accounting

CREATE TABLE fiscal_period (
    id              BIGSERIAL PRIMARY KEY,
    organization_id BIGINT      NOT NULL REFERENCES organizations (id),
    name            VARCHAR(100) NOT NULL,
    start_date      DATE        NOT NULL,
    end_date        DATE        NOT NULL,
    status          VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    deleted         BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_fiscal_period_organization_id ON fiscal_period (organization_id);

CREATE TABLE chart_of_account (
    id              BIGSERIAL PRIMARY KEY,
    organization_id BIGINT      NOT NULL REFERENCES organizations (id),
    code            VARCHAR(20) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    account_type    VARCHAR(50) NOT NULL,
    description     VARCHAR(500),
    active          BOOLEAN     NOT NULL DEFAULT TRUE,
    system_account  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    deleted         BOOLEAN     NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_chart_of_account_org_code UNIQUE (organization_id, code)
);

CREATE INDEX idx_chart_of_account_organization_id ON chart_of_account (organization_id);
CREATE INDEX idx_chart_of_account_type ON chart_of_account (account_type);

CREATE TABLE journal_entry (
    id                  BIGSERIAL PRIMARY KEY,
    organization_id     BIGINT      NOT NULL REFERENCES organizations (id),
    fiscal_period_id    BIGINT      NOT NULL REFERENCES fiscal_period (id),
    entry_date          DATE        NOT NULL,
    description         VARCHAR(500) NOT NULL,
    source_type         VARCHAR(50) NOT NULL,
    source_id           BIGINT      NOT NULL,
    posted_by_user_id   BIGINT,
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    deleted             BOOLEAN     NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_journal_entry_source UNIQUE (organization_id, source_type, source_id)
);

CREATE INDEX idx_journal_entry_organization_id ON journal_entry (organization_id);
CREATE INDEX idx_journal_entry_fiscal_period_id ON journal_entry (fiscal_period_id);
CREATE INDEX idx_journal_entry_entry_date ON journal_entry (entry_date);

CREATE TABLE journal_line (
    id               BIGSERIAL PRIMARY KEY,
    journal_entry_id BIGINT         NOT NULL REFERENCES journal_entry (id),
    account_id       BIGINT         NOT NULL REFERENCES chart_of_account (id),
    fund_id          BIGINT         REFERENCES fund (id),
    debit_amount     NUMERIC(19, 2) NOT NULL DEFAULT 0,
    credit_amount    NUMERIC(19, 2) NOT NULL DEFAULT 0,
    line_description VARCHAR(500),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_journal_line_journal_entry_id ON journal_line (journal_entry_id);
CREATE INDEX idx_journal_line_account_id ON journal_line (account_id);
CREATE INDEX idx_journal_line_fund_id ON journal_line (fund_id);
