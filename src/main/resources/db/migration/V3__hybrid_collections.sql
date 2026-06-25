-- Phase 2.5: Hybrid manual payments and collection sessions

CREATE TABLE collection_session (
    id                   BIGSERIAL PRIMARY KEY,
    organization_id      BIGINT         NOT NULL REFERENCES organizations (id),
    collection_type      VARCHAR(50)    NOT NULL,
    title                VARCHAR(255),
    description          VARCHAR(1000),
    total_amount         NUMERIC(19, 2),
    payment_method       VARCHAR(50),
    collected_at         TIMESTAMP,
    location             VARCHAR(255),
    collected_by_user_id BIGINT,
    verified_by_user_id  BIGINT,
    status               VARCHAR(50)    NOT NULL DEFAULT 'DRAFT',
    campaign_id          BIGINT         REFERENCES campaign (id),
    notes                VARCHAR(1000),
    created_at           TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP      NOT NULL DEFAULT NOW(),
    deleted              BOOLEAN        NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_collection_session_organization_id ON collection_session (organization_id);
CREATE INDEX idx_collection_session_collection_type ON collection_session (collection_type);
CREATE INDEX idx_collection_session_status ON collection_session (status);

ALTER TABLE donation
    ADD COLUMN collection_session_id BIGINT REFERENCES collection_session (id);

CREATE INDEX idx_donation_collection_session_id ON donation (collection_session_id);

ALTER TABLE collection_session
    ADD COLUMN donation_id BIGINT REFERENCES donation (id),
    ADD CONSTRAINT uq_collection_session_donation_id UNIQUE (donation_id);

ALTER TABLE payment
    ADD COLUMN channel VARCHAR(50) NOT NULL DEFAULT 'GATEWAY',
    ADD COLUMN recorded_by_user_id BIGINT,
    ADD COLUMN receipt_number VARCHAR(100),
    ADD COLUMN payment_notes VARCHAR(500),
    ADD COLUMN collection_date TIMESTAMP;

CREATE INDEX idx_payment_channel ON payment (channel);
