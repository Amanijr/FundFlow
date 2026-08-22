-- Link donations to funds so journal posting can follow tithe / offering / building pots.

ALTER TABLE donation
    ADD COLUMN fund_id BIGINT REFERENCES fund (id);

CREATE INDEX idx_donation_fund_id ON donation (fund_id);
