-- Members are a church-only person table, not an alias of donor.

CREATE TABLE church_member (
    id                 BIGSERIAL PRIMARY KEY,
    organization_id    BIGINT         NOT NULL REFERENCES organizations (id),
    first_name         VARCHAR(50)    NOT NULL,
    last_name          VARCHAR(50)    NOT NULL,
    email              VARCHAR(100),
    address            VARCHAR(255),
    phone              VARCHAR(15),
    city               VARCHAR(100),
    state              VARCHAR(100),
    country            VARCHAR(100),
    membership_status  VARCHAR(50)    NOT NULL DEFAULT 'ACTIVE',
    joined_at          DATE,
    notes              VARCHAR(2000),
    user_id            BIGINT         REFERENCES users (id),
    created_at         TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted            BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_church_member_organization_id ON church_member (organization_id);
CREATE INDEX idx_church_member_org_name ON church_member (organization_id, last_name, first_name);
CREATE INDEX idx_church_member_membership_status ON church_member (organization_id, membership_status);

INSERT INTO church_member (
    id, organization_id, first_name, last_name, email, address, phone, city, state, country,
    membership_status, joined_at, notes, user_id, created_at, updated_at, deleted
)
SELECT
    d.id, d.organization_id, d.first_name, d.last_name, d.email, d.address, d.phone, d.city, d.state, d.country,
    COALESCE(d.membership_status, 'ACTIVE'), d.joined_at, d.notes, d.user_id, d.created_at, d.updated_at, d.deleted
FROM donor d
JOIN organizations o ON o.id = d.organization_id
WHERE o.type IN ('CHURCH', 'RELIGIOUS_INSTITUTION');

SELECT setval(
    pg_get_serial_sequence('church_member', 'id'),
    COALESCE((SELECT MAX(id) FROM church_member), 1),
    (SELECT EXISTS (SELECT 1 FROM church_member))
);

ALTER TABLE donation
    ADD COLUMN member_id BIGINT REFERENCES church_member (id);

CREATE INDEX idx_donation_member_id ON donation (member_id);

UPDATE donation don
SET member_id = don.donor_id,
    donor_id = NULL
FROM organizations o
WHERE don.organization_id = o.id
  AND o.type IN ('CHURCH', 'RELIGIOUS_INSTITUTION')
  AND don.donor_id IS NOT NULL;

ALTER TABLE member_ministry DROP CONSTRAINT IF EXISTS member_ministry_donor_id_fkey;
ALTER TABLE member_ministry DROP CONSTRAINT IF EXISTS uq_member_ministry_pair;

ALTER TABLE member_ministry RENAME COLUMN donor_id TO member_id;

ALTER TABLE member_ministry
    ADD CONSTRAINT member_ministry_member_id_fkey
        FOREIGN KEY (member_id) REFERENCES church_member (id);

ALTER TABLE member_ministry
    ADD CONSTRAINT uq_member_ministry_pair UNIQUE (organization_id, member_id, ministry_id);

ALTER INDEX IF EXISTS idx_member_ministry_donor_id RENAME TO idx_member_ministry_member_id;

DELETE FROM donor d
USING organizations o
WHERE d.organization_id = o.id
  AND o.type IN ('CHURCH', 'RELIGIOUS_INSTITUTION')
  AND NOT EXISTS (SELECT 1 FROM pledge p WHERE p.donor_id = d.id)
  AND NOT EXISTS (SELECT 1 FROM recurring_donation r WHERE r.donor_id = d.id)
  AND NOT EXISTS (SELECT 1 FROM student_sponsorship s WHERE s.donor_id = d.id)
  AND NOT EXISTS (SELECT 1 FROM donation don WHERE don.donor_id = d.id);
