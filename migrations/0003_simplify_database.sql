-- Drop ingredients table (not used)
DROP TABLE IF EXISTS ingredients;

-- Remove unused columns from recipes table
CREATE TABLE recipes_new (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT INTO recipes_new (id, user_id, name, description, image_url, created_at, updated_at)
SELECT id, user_id, name, description, image_url, created_at, updated_at FROM recipes;

DROP TABLE recipes;
ALTER TABLE recipes_new RENAME TO recipes;

-- Drop unused indexes
DROP INDEX IF EXISTS idx_recipes_created_at;
DROP INDEX IF EXISTS idx_recipes_category;
DROP INDEX IF EXISTS idx_ingredients_recipe_id;
DROP INDEX IF EXISTS idx_meals_meal_type;

-- Recreate needed indexes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_date ON meals(date);
CREATE INDEX idx_meals_recipe_id ON meals(recipe_id);