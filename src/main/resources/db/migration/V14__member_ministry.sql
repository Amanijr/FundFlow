-- Member belongs to many ministries (departments). One row per member+ministry.

CREATE TABLE member_ministry (
    id               BIGSERIAL PRIMARY KEY,
    organization_id  BIGINT         NOT NULL REFERENCES organizations (id),
    donor_id         BIGINT         NOT NULL REFERENCES donor (id),
    ministry_id      BIGINT         NOT NULL REFERENCES ministry (id),
    role             VARCHAR(100),
    status           VARCHAR(50)    NOT NULL DEFAULT 'ACTIVE',
    joined_at        DATE,
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted          BOOLEAN        NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_member_ministry_pair UNIQUE (organization_id, donor_id, ministry_id)
);

CREATE INDEX idx_member_ministry_organization_id ON member_ministry (organization_id);
CREATE INDEX idx_member_ministry_ministry_id ON member_ministry (organization_id, ministry_id);
CREATE INDEX idx_member_ministry_donor_id ON member_ministry (organization_id, donor_id);
