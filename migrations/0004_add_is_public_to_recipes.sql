-- Add public sharing flag to recipes
ALTER TABLE recipes ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0;

-- Index for public listing
CREATE INDEX IF NOT EXISTS idx_recipes_is_public ON recipes(is_public);

