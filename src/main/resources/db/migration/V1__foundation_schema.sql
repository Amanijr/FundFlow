-- Phase 1: Foundation schema

CREATE TABLE organizations (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    type            VARCHAR(50)  NOT NULL,
    email           VARCHAR(100),
    phone           VARCHAR(20),
    address         VARCHAR(255),
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted         BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_organizations_slug UNIQUE (slug)
);

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    organization_id BIGINT       REFERENCES organizations (id),
    email           VARCHAR(100) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(50)  NOT NULL,
    last_name       VARCHAR(50)  NOT NULL,
    role            VARCHAR(50)  NOT NULL,
    enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted         BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX idx_users_organization_id ON users (organization_id);

CREATE TABLE donor (
    id              BIGSERIAL PRIMARY KEY,
    organization_id BIGINT       NOT NULL REFERENCES organizations (id),
    first_name      VARCHAR(50)  NOT NULL,
    last_name       VARCHAR(50)  NOT NULL,
    email           VARCHAR(100) NOT NULL,
    address         VARCHAR(255),
    phone           VARCHAR(15)  NOT NULL,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted         BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_donor_org_email UNIQUE (organization_id, email),
    CONSTRAINT uq_donor_org_phone UNIQUE (organization_id, phone)
);

CREATE INDEX idx_donor_organization_id ON donor (organization_id);

CREATE TABLE donation (
    id              BIGSERIAL PRIMARY KEY,
    organization_id BIGINT       NOT NULL REFERENCES organizations (id),
    donor_id        BIGINT       NOT NULL REFERENCES donor (id),
    amount          NUMERIC(19, 2) NOT NULL,
    donation_time   TIMESTAMP,
    status          VARCHAR(50),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted         BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_donation_organization_id ON donation (organization_id);
CREATE INDEX idx_donation_donor_id ON donation (donor_id);
CREATE INDEX idx_donation_status ON donation (status);

CREATE TABLE payment (
    id              BIGSERIAL PRIMARY KEY,
    organization_id BIGINT       NOT NULL REFERENCES organizations (id),
    donation_id     BIGINT       NOT NULL REFERENCES donation (id),
    payment_method  VARCHAR(50),
    transaction_id  VARCHAR(255),
    successful      BOOLEAN,
    processed_at    TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    deleted         BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT uq_payment_donation_id UNIQUE (donation_id)
);

CREATE INDEX idx_payment_organization_id ON payment (organization_id);
