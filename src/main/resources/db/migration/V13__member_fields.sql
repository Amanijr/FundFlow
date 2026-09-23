-- Members: optional contact, membership fields. Existing donors stay ACTIVE.
-- Unique email/phone still apply when present; multiple NULL contacts are allowed.

ALTER TABLE donor
    ALTER COLUMN email DROP NOT NULL;

ALTER TABLE donor
    ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE donor
    ADD COLUMN membership_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE donor
    ADD COLUMN joined_at DATE;

ALTER TABLE donor
    ADD COLUMN notes VARCHAR(2000);

ALTER TABLE donor
    ADD COLUMN user_id BIGINT REFERENCES users (id);

CREATE INDEX idx_donor_org_name ON donor (organization_id, last_name, first_name);
CREATE INDEX idx_donor_membership_status ON donor (organization_id, membership_status);
