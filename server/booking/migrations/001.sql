BEGIN;
CREATE TABLE IF NOT EXISTS aq_booking_schema (version integer PRIMARY KEY, installed_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS aq_quotes (
 id uuid PRIMARY KEY, document jsonb NOT NULL, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS aq_bookings (
 id uuid PRIMARY KEY, quote_id uuid NOT NULL UNIQUE REFERENCES aq_quotes(id), idempotency_key uuid NOT NULL UNIQUE,
 request_hash text NOT NULL, guest jsonb NOT NULL, state text NOT NULL CHECK (state IN ('checking','submitting','uncertain','review','confirmed','rejected','price_changed')),
 reservation_id bigint UNIQUE, reason text, create_attempts integer NOT NULL DEFAULT 0 CHECK (create_attempts BETWEEN 0 AND 1),
 updated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now(),
 CHECK (state <> 'confirmed' OR reservation_id IS NOT NULL)
);
-- Intentionally one occupied pilot slot across ALL sessions/offers/processes.
CREATE TABLE IF NOT EXISTS aq_pilot_slots (scope text PRIMARY KEY, booking_id uuid NOT NULL UNIQUE REFERENCES aq_bookings(id));
CREATE TABLE IF NOT EXISTS aq_booking_events (
 id bigserial PRIMARY KEY, booking_id uuid NOT NULL REFERENCES aq_bookings(id), state text NOT NULL, reason text, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS aq_preflight (
 scope text PRIMARY KEY, base_cents bigint NOT NULL, checked_at timestamptz NOT NULL
);
INSERT INTO aq_booking_schema(version) VALUES (1) ON CONFLICT DO NOTHING;
COMMIT;
