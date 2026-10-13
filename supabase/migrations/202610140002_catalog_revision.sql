CREATE TABLE knovera.catalog_revision (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  version bigint NOT NULL DEFAULT 1
);
INSERT INTO knovera.catalog_revision(id) VALUES(true);
ALTER TABLE knovera.catalog_revision ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON knovera.catalog_revision FROM anon, authenticated;

CREATE FUNCTION knovera.advance_catalog_revision() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE knovera.catalog_revision SET version = version + 1 WHERE id = true;
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION knovera.advance_catalog_revision() FROM PUBLIC;
CREATE TRIGGER catalog_books_changed AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON knovera.books
FOR EACH STATEMENT EXECUTE FUNCTION knovera.advance_catalog_revision();
CREATE TRIGGER catalog_bundles_changed AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON knovera.bundles
FOR EACH STATEMENT EXECUTE FUNCTION knovera.advance_catalog_revision();
CREATE TRIGGER catalog_bundle_books_changed AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE ON knovera.bundle_books
FOR EACH STATEMENT EXECUTE FUNCTION knovera.advance_catalog_revision();
