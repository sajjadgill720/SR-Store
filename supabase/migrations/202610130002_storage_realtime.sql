-- Signed Storage URLs replace the old preview-token store.
DROP TABLE knovera.download_tokens;

-- A private, receive-only invalidation channel. Data stays behind the existing API.
-- Supabase owns realtime.messages and already enables RLS on it.
CREATE POLICY knovera_receive_community_changes ON realtime.messages
FOR SELECT TO anon, authenticated
USING (realtime.topic() = 'knovera:community' AND extension = 'broadcast');

CREATE FUNCTION knovera.notify_community_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  -- Never send NEW/OLD rows, IDs, journal text, reports, passwords or session tokens.
  PERFORM realtime.send('{}'::jsonb, 'changed', 'knovera:community', true);
  RETURN NULL;
END;
$$;
REVOKE ALL ON FUNCTION knovera.notify_community_change() FROM PUBLIC;

-- Statement triggers coalesce bulk operations; events are delivered after commit.
CREATE TRIGGER community_threads_changed AFTER INSERT OR UPDATE OR DELETE ON knovera.threads
FOR EACH STATEMENT EXECUTE FUNCTION knovera.notify_community_change();
CREATE TRIGGER community_replies_changed AFTER INSERT OR UPDATE OR DELETE ON knovera.replies
FOR EACH STATEMENT EXECUTE FUNCTION knovera.notify_community_change();
CREATE TRIGGER community_activity_changed AFTER INSERT OR UPDATE OR DELETE ON knovera.activity
FOR EACH STATEMENT EXECUTE FUNCTION knovera.notify_community_change();
CREATE TRIGGER community_reports_changed AFTER INSERT OR UPDATE OR DELETE ON knovera.reports
FOR EACH STATEMENT EXECUTE FUNCTION knovera.notify_community_change();
