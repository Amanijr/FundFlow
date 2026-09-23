-- Churches can mark one fund as the Sunday offering pot.
-- Collections may override it; if neither is set, the gift is not assigned to a fund.

ALTER TABLE fund
    ADD COLUMN default_for_collections BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX uq_fund_default_for_collections
    ON fund (organization_id)
    WHERE default_for_collections = TRUE AND deleted = FALSE;

ALTER TABLE collection_session
    ADD COLUMN fund_id BIGINT REFERENCES fund (id);

CREATE INDEX idx_collection_session_fund_id ON collection_session (fund_id);
