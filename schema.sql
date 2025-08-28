-- Create recipes table
CREATE TABLE recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prep_time INTEGER DEFAULT 0,
  cook_time INTEGER DEFAULT 0,
  servings INTEGER DEFAULT 1,
  difficulty TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'main',
  instructions TEXT, -- JSON array of strings
  calories INTEGER,
  protein REAL,
  carbs REAL,
  fat REAL,
  fiber REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Create ingredients table
CREATE TABLE ingredients (
  id TEXT PRIMARY KEY,
  recipe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  unit TEXT,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- Create meals table
CREATE TABLE meals (
  id TEXT PRIMARY KEY,
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
CREATE INDEX idx_recipes_created_at ON recipes(created_at);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX idx_meals_date ON meals(date);
CREATE INDEX idx_meals_meal_type ON meals(meal_type);
CREATE INDEX idx_meals_recipe_id ON meals(recipe_id);