-- Application-private schema. Access is through the Next.js server, never the Data API.
CREATE SCHEMA IF NOT EXISTS knovera;
REVOKE ALL ON SCHEMA knovera FROM PUBLIC;

CREATE TABLE knovera.books (id text PRIMARY KEY, data jsonb NOT NULL CHECK (jsonb_typeof(data)='object' AND NOT data ? 'id'));
CREATE UNIQUE INDEX books_slug ON knovera.books ((data->>'slug'));
CREATE TABLE knovera.bundles (id text PRIMARY KEY, data jsonb NOT NULL CHECK (NOT data ? 'books' AND NOT data ? 'id'));
CREATE UNIQUE INDEX bundles_slug ON knovera.bundles ((data->>'slug'));
CREATE TABLE knovera.bundle_books (bundle_id text REFERENCES knovera.bundles ON DELETE CASCADE, book_id text REFERENCES knovera.books, position integer NOT NULL, PRIMARY KEY(bundle_id,book_id));
CREATE TABLE knovera.orders (id text PRIMARY KEY, data jsonb NOT NULL CHECK (NOT data ? 'id' AND data->>'paymentStatus' IN ('paid','pending','failed','refunded')));
CREATE UNIQUE INDEX orders_token ON knovera.orders ((data->>'publicToken'));
CREATE UNIQUE INDEX orders_provider ON knovera.orders ((data->>'provider'),(data->>'providerOrderId')) WHERE data->>'providerOrderId' IS NOT NULL;
CREATE INDEX orders_email ON knovera.orders ((lower(data->>'customerEmail')));
-- Items in an order are historical purchase snapshots, not copies of the live catalog.
CREATE TABLE knovera.entitlements (id text PRIMARY KEY, "customerEmail" text NOT NULL, "bookId" text NOT NULL REFERENCES knovera.books, "orderId" text NOT NULL REFERENCES knovera.orders, status text NOT NULL CHECK(status IN ('active','revoked')), "grantedAt" text NOT NULL, "revokedAt" text, UNIQUE("orderId","bookId"));
CREATE INDEX entitlement_owner ON knovera.entitlements ("customerEmail",status);
CREATE TABLE knovera.download_tokens (token text PRIMARY KEY, "customerEmail" text NOT NULL, "bookId" text NOT NULL REFERENCES knovera.books, format text NOT NULL, "fileName" text NOT NULL, "expiresAt" bigint NOT NULL, used boolean NOT NULL DEFAULT false);
CREATE TABLE knovera.support_tickets (id text PRIMARY KEY, data jsonb NOT NULL CHECK(NOT data ? 'id'));
CREATE TABLE knovera.reviews (id text PRIMARY KEY, data jsonb NOT NULL CHECK(NOT data ? 'id'));
CREATE TABLE knovera.audit_logs (id text PRIMARY KEY, action text NOT NULL, details text NOT NULL, timestamp text NOT NULL);

CREATE TABLE knovera.members(id text PRIMARY KEY, username text UNIQUE NOT NULL, name text NOT NULL, password text NOT NULL);
CREATE TABLE knovera.sessions(token text PRIMARY KEY, member text NOT NULL REFERENCES knovera.members, expires bigint NOT NULL);
CREATE INDEX sessions_expiry ON knovera.sessions(expires);
CREATE TABLE knovera.activity(member text PRIMARY KEY REFERENCES knovera.members, value jsonb NOT NULL, revision integer NOT NULL DEFAULT 0);
CREATE TABLE knovera.threads(id text PRIMARY KEY, circle text NOT NULL, title text NOT NULL, body text NOT NULL, member text NOT NULL REFERENCES knovera.members, "createdAt" text NOT NULL, hidden boolean NOT NULL DEFAULT false);
CREATE TABLE knovera.replies(id text PRIMARY KEY, discussion text NOT NULL, "parentId" text REFERENCES knovera.replies DEFERRABLE INITIALLY DEFERRED, body text NOT NULL, member text NOT NULL REFERENCES knovera.members, "createdAt" text NOT NULL, hidden boolean NOT NULL DEFAULT false, UNIQUE(id,discussion), FOREIGN KEY("parentId",discussion) REFERENCES knovera.replies(id,discussion) DEFERRABLE INITIALLY DEFERRED);
CREATE INDEX replies_discussion ON knovera.replies(discussion,"createdAt");
CREATE INDEX threads_circle ON knovera.threads(circle,"createdAt");
CREATE TABLE knovera.reports(id text PRIMARY KEY,target text NOT NULL,kind text NOT NULL CHECK(kind IN ('thread','reply')),member text NOT NULL REFERENCES knovera.members,reason text NOT NULL,"createdAt" text NOT NULL,resolved boolean NOT NULL DEFAULT false,UNIQUE(target,kind,member));
CREATE TABLE knovera.limits(key text PRIMARY KEY,count integer NOT NULL,expires bigint NOT NULL);

-- No browser-role policies. RLS is defense in depth; the schema is not exposed.
DO $$ DECLARE t record; BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='knovera' LOOP
    EXECUTE format('ALTER TABLE knovera.%I ENABLE ROW LEVEL SECURITY',t.tablename);
    EXECUTE format('REVOKE ALL ON knovera.%I FROM PUBLIC',t.tablename);
    IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname='anon') THEN EXECUTE format('REVOKE ALL ON knovera.%I FROM anon, authenticated',t.tablename); END IF;
  END LOOP;
END $$;
