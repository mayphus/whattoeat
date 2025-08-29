-- Add per-user scoping columns
ALTER TABLE recipes ADD COLUMN user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON recipes(user_id);

ALTER TABLE meals ADD COLUMN user_id TEXT;
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);

-- Note: existing rows will have NULL user_id and will be hidden by API filters.
-- After deploying, newly created data will include the current user's ID.

