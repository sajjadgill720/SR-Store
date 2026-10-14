CREATE TABLE knovera.checkout_intents (
 id uuid PRIMARY KEY,
 token_hash text UNIQUE NOT NULL,
 data jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE knovera.checkout_intents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON knovera.checkout_intents FROM PUBLIC, anon, authenticated;
CREATE UNIQUE INDEX checkout_intents_provider_order ON knovera.checkout_intents ((data->>'providerOrderId')) WHERE data->>'providerOrderId' IS NOT NULL;
