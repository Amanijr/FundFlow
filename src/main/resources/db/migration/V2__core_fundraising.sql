-- Phase 2: Core fundraising schema

CREATE TABLE campaign (
    id              BIGSERIAL PRIMARY KEY,
    organization_id BIGINT         NOT NULL REFERENCES organizations (id),
    name            VARCHAR(255)   NOT NULL,
    description     VARCHAR(2000),
    target_amount   NUMERIC(19, 2),
    start_date      DATE,
    end_date        DATE,
    status          VARCHAR(50)    NOT NULL DEFAULT 'DRAFT',
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted         BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_campaign_organization_id ON campaign (organization_id);
CREATE INDEX idx_campaign_status ON campaign (status);

CREATE TABLE recurring_donation (
    id              BIGSERIAL PRIMARY KEY,
    organization_id BIGINT         NOT NULL REFERENCES organizations (id),
    donor_id        BIGINT         NOT NULL REFERENCES donor (id),
    campaign_id     BIGINT         REFERENCES campaign (id),
    amount          NUMERIC(19, 2) NOT NULL,
    frequency       VARCHAR(50)    NOT NULL,
    start_date      DATE           NOT NULL,
    end_date        DATE,
    active          BOOLEAN        NOT NULL DEFAULT TRUE,
    notes           VARCHAR(500),
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted         BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_recurring_donation_organization_id ON recurring_donation (organization_id);
CREATE INDEX idx_recurring_donation_donor_id ON recurring_donation (donor_id);

CREATE TABLE pledge (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    donor_id         BIGINT         NOT NULL REFERENCES donor (id),
    campaign_id      BIGINT         REFERENCES campaign (id),
    pledged_amount   NUMERIC(19, 2) NOT NULL,
    fulfilled_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,
    due_date         DATE,
    status           VARCHAR(50)    NOT NULL DEFAULT 'OPEN',
    notes            VARCHAR(1000),
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_pledge_organization_id ON pledge (organization_id);
CREATE INDEX idx_pledge_donor_id ON pledge (donor_id);

ALTER TABLE donation
    ALTER COLUMN donor_id DROP NOT NULL;

ALTER TABLE donation
    ADD COLUMN donation_type VARCHAR(50) NOT NULL DEFAULT 'ONE_TIME',
    ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN campaign_id BIGINT REFERENCES campaign (id),
    ADD COLUMN pledge_id BIGINT REFERENCES pledge (id),
    ADD COLUMN recurring_donation_id BIGINT REFERENCES recurring_donation (id),
    ADD COLUMN source VARCHAR(100),
    ADD COLUMN notes VARCHAR(1000),
    ADD COLUMN item_description VARCHAR(500),
    ADD COLUMN estimated_value NUMERIC(19, 2);

CREATE INDEX idx_donation_campaign_id ON donation (campaign_id);
CREATE INDEX idx_donation_pledge_id ON donation (pledge_id);
CREATE INDEX idx_donation_recurring_donation_id ON donation (recurring_donation_id);
CREATE INDEX idx_donation_donation_type ON donation (donation_type);
