CREATE TABLE church_partnership (
    id                 BIGSERIAL PRIMARY KEY,
    organization_id    BIGINT         NOT NULL REFERENCES organizations (id),
    member_id          BIGINT         NOT NULL REFERENCES church_member (id),
    fund_id            BIGINT         REFERENCES fund (id),
    monthly_amount     NUMERIC(19, 2) NOT NULL,
    start_date         DATE           NOT NULL,
    end_date           DATE,
    status             VARCHAR(20)    NOT NULL DEFAULT 'ACTIVE',
    notes              VARCHAR(2000),
    created_at         TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted            BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_church_partnership_org ON church_partnership (organization_id);
CREATE INDEX idx_church_partnership_member ON church_partnership (member_id);

ALTER TABLE donation
    ADD COLUMN partnership_id BIGINT REFERENCES church_partnership (id);

ALTER TABLE donation
    ADD COLUMN partnership_month DATE;

CREATE INDEX idx_donation_partnership_id ON donation (partnership_id);
CREATE INDEX idx_donation_partnership_month ON donation (partnership_id, partnership_month);
