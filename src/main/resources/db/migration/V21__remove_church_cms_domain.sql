-- TASK: Extract Church CMS from FundFlow.
-- Preserves financial history by converting church members linked to gifts into donors,
-- then drops CMS-only tables and donation church FKs.
-- Archive note: operators needing CMS export should dump church_* tables before applying.

-- 1) Convert legacy church/religious org types to CSO community orgs
UPDATE organizations
SET type = 'COMMUNITY_ORGANIZATION'
WHERE type IN ('CHURCH', 'RELIGIOUS_INSTITUTION');

-- 2) Recreate donors from church_member (unique email/phone per org)
INSERT INTO donor (
    organization_id, first_name, last_name, email, address, phone, city, state, country,
    membership_status, joined_at, notes, user_id, created_at, updated_at, deleted
)
SELECT
    cm.organization_id,
    cm.first_name,
    cm.last_name,
    COALESCE(NULLIF(TRIM(cm.email), ''), 'migrated-member-' || cm.id || '@fundflow.local'),
    cm.address,
    COALESCE(NULLIF(TRIM(cm.phone), ''), 'M' || LPAD(cm.id::text, 14, '0')),
    cm.city,
    cm.state,
    cm.country,
    COALESCE(cm.membership_status, 'ACTIVE'),
    cm.joined_at,
    CASE
        WHEN cm.notes IS NULL OR TRIM(cm.notes) = '' THEN 'Migrated from church_member id=' || cm.id
        ELSE cm.notes || E'\n[Migrated from church_member id=' || cm.id || ']'
    END,
    cm.user_id,
    COALESCE(cm.created_at, NOW()),
    NOW(),
    COALESCE(cm.deleted, FALSE)
FROM church_member cm
WHERE NOT EXISTS (
    SELECT 1
    FROM donor d
    WHERE d.organization_id = cm.organization_id
      AND d.email = COALESCE(NULLIF(TRIM(cm.email), ''), 'migrated-member-' || cm.id || '@fundflow.local')
      AND d.deleted = FALSE
);

-- 3) Rewire donations that used member_id onto matching donor
UPDATE donation don
SET donor_id = d.id,
    member_id = NULL
FROM church_member cm
JOIN donor d
  ON d.organization_id = cm.organization_id
 AND d.email = COALESCE(NULLIF(TRIM(cm.email), ''), 'migrated-member-' || cm.id || '@fundflow.local')
 AND d.deleted = FALSE
WHERE don.member_id = cm.id
  AND don.donor_id IS NULL;

-- Anonymous / unresolved: clear member pointer without inventing a donor
UPDATE donation
SET member_id = NULL
WHERE member_id IS NOT NULL;

-- 4) Clear partnership attribution (CMS pledges); keep gift amounts/funds intact
UPDATE donation
SET partnership_id = NULL,
    partnership_month = NULL
WHERE partnership_id IS NOT NULL
   OR partnership_month IS NOT NULL;

-- 5) Drop donation church columns
ALTER TABLE donation DROP CONSTRAINT IF EXISTS donation_member_id_fkey;
ALTER TABLE donation DROP CONSTRAINT IF EXISTS donation_partnership_id_fkey;
DROP INDEX IF EXISTS idx_donation_member_id;
DROP INDEX IF EXISTS idx_donation_partnership_id;
ALTER TABLE donation DROP COLUMN IF EXISTS member_id;
ALTER TABLE donation DROP COLUMN IF EXISTS partnership_id;
ALTER TABLE donation DROP COLUMN IF EXISTS partnership_month;

-- 6) Drop CMS tables (deepest children first)
DROP TABLE IF EXISTS attendance_record CASCADE;
DROP TABLE IF EXISTS member_ministry CASCADE;
DROP TABLE IF EXISTS service_event CASCADE;
DROP TABLE IF EXISTS church_partnership CASCADE;
DROP TABLE IF EXISTS ministry CASCADE;
DROP TABLE IF EXISTS church_member CASCADE;

-- 7) Neutralize church-flavored collection type labels in historical rows
UPDATE collection_session
SET collection_type = 'GENERAL'
WHERE collection_type IN ('SERVICE_OFFERING', 'DEPARTMENT');
