-- Keep legacy member IDs and content intact; link verified Auth identities explicitly.
ALTER TABLE knovera.members ADD COLUMN auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE knovera.members ALTER COLUMN password DROP NOT NULL;
-- Old password hashes are retained only for controlled migration, never used for login.
DROP TABLE knovera.sessions;

CREATE TABLE knovera.account_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin','moderator'))
);
CREATE TABLE knovera.order_owners (
  order_id text PRIMARY KEY REFERENCES knovera.orders(id),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
-- A deleted account's ownership record remains, preventing automatic reassignment.
CREATE INDEX order_owners_user ON knovera.order_owners(user_id);
ALTER TABLE knovera.account_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knovera.order_owners ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON knovera.account_roles,knovera.order_owners FROM PUBLIC,anon,authenticated;
