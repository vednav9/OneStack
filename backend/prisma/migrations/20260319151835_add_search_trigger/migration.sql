-- Add search vector column (if not already added)
ALTER TABLE "Blog"
ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

-- Function
CREATE OR REPLACE FUNCTION blog_search_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER blog_search_trigger
BEFORE INSERT OR UPDATE ON "Blog"
FOR EACH ROW EXECUTE FUNCTION blog_search_update();