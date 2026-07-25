-- Phase 3: Financial operations — funds and expenses

CREATE TABLE fund (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    name             VARCHAR(255)   NOT NULL,
    code             VARCHAR(50)    NOT NULL,
    type             VARCHAR(50)    NOT NULL,
    description      VARCHAR(1000),
    opening_balance  NUMERIC(19, 2) NOT NULL DEFAULT 0,
    active           BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_fund_org_code UNIQUE (organization_id, code)
);

CREATE INDEX idx_fund_organization_id ON fund (organization_id);
CREATE INDEX idx_fund_type ON fund (type);

CREATE TABLE fund_transfer (
    id                    BIGSERIAL PRIMARY KEY,
    organization_id       BIGINT         NOT NULL REFERENCES organizations (id),
    from_fund_id          BIGINT         NOT NULL REFERENCES fund (id),
    to_fund_id            BIGINT         NOT NULL REFERENCES fund (id),
    amount                NUMERIC(19, 2) NOT NULL,
    reason                VARCHAR(500),
    transferred_at        TIMESTAMP      NOT NULL,
    transferred_by_user_id BIGINT,
    status                VARCHAR(50)    NOT NULL DEFAULT 'COMPLETED',
    created_at            TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted               BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_fund_transfer_organization_id ON fund_transfer (organization_id);
CREATE INDEX idx_fund_transfer_from_fund_id ON fund_transfer (from_fund_id);
CREATE INDEX idx_fund_transfer_to_fund_id ON fund_transfer (to_fund_id);

CREATE TABLE expense (
    id                    BIGSERIAL PRIMARY KEY,
    organization_id       BIGINT         NOT NULL REFERENCES organizations (id),
    title                 VARCHAR(255)   NOT NULL,
    description           VARCHAR(2000),
    amount                NUMERIC(19, 2) NOT NULL,
    category              VARCHAR(50)    NOT NULL,
    expense_type          VARCHAR(50)    NOT NULL DEFAULT 'REQUEST',
    fund_id               BIGINT         REFERENCES fund (id),
    status                VARCHAR(50)    NOT NULL DEFAULT 'DRAFT',
    requested_by_user_id  BIGINT,
    payee_name            VARCHAR(255),
    submitted_at          TIMESTAMP,
    approved_by_user_id   BIGINT,
    approved_at           TIMESTAMP,
    rejection_reason      VARCHAR(500),
    paid_at               TIMESTAMP,
    paid_by_user_id       BIGINT,
    payment_method        VARCHAR(50),
    payment_reference     VARCHAR(100),
    reconciled_at         TIMESTAMP,
    reconciled_by_user_id BIGINT,
    created_at            TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted               BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_expense_organization_id ON expense (organization_id);
CREATE INDEX idx_expense_fund_id ON expense (fund_id);
CREATE INDEX idx_expense_status ON expense (status);
CREATE INDEX idx_expense_category ON expense (category);
