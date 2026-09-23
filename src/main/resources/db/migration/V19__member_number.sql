-- User-facing member number, unique per church. Auto-filled for existing rows.

ALTER TABLE church_member
    ADD COLUMN member_number VARCHAR(32);

UPDATE church_member
SET member_number = 'M-' || LPAD(id::text, 4, '0')
WHERE member_number IS NULL;

ALTER TABLE church_member
    ALTER COLUMN member_number SET NOT NULL;

CREATE UNIQUE INDEX uq_church_member_org_number
    ON church_member (organization_id, member_number);
