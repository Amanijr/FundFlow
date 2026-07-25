-- Phase 6: Budgeting

ALTER TABLE expense ADD COLUMN department VARCHAR(100);

CREATE TABLE budget (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    name             VARCHAR(255)   NOT NULL,
    fiscal_year      INT            NOT NULL,
    start_date       DATE           NOT NULL,
    end_date         DATE           NOT NULL,
    status           VARCHAR(50)    NOT NULL DEFAULT 'DRAFT',
    scope_type       VARCHAR(50)    NOT NULL DEFAULT 'ORGANIZATION',
    department       VARCHAR(100),
    fund_id          BIGINT         REFERENCES fund (id),
    campaign_id      BIGINT         REFERENCES campaign (id),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_budget_organization_id ON budget (organization_id);
CREATE INDEX idx_budget_fiscal_year ON budget (fiscal_year);
CREATE INDEX idx_budget_status ON budget (status);
CREATE INDEX idx_budget_scope_type ON budget (scope_type);

CREATE TABLE budget_line (
    id               BIGSERIAL PRIMARY KEY,
    budget_id        BIGINT         NOT NULL REFERENCES budget (id),
    category         VARCHAR(50)    NOT NULL,
    department       VARCHAR(100),
    fund_id          BIGINT         REFERENCES fund (id),
    amount           NUMERIC(19, 2) NOT NULL,
    description      VARCHAR(500),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_budget_line_budget_id ON budget_line (budget_id);
CREATE INDEX idx_budget_line_category ON budget_line (category);
