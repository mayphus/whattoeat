-- Create recipes table
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_public INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Create meals table  
CREATE TABLE meals (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  date TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  recipe_id TEXT,
  custom_food_name TEXT,
  portion REAL DEFAULT 1.0,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_is_public ON recipes(is_public);
CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_date ON meals(date);
CREATE INDEX idx_meals_recipe_id ON meals(recipe_id);
