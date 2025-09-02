import type { Recipe, CreateRecipeRequest, Meal, CreateMealRequest, MealAnalytics } from '../src/types'

export class Database {
  private db: D1Database
  
  constructor(db: D1Database) {
    this.db = db
  }

  // Recipe methods
  async createRecipe(recipe: CreateRecipeRequest, userId: string): Promise<Recipe> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    
    const stmt = this.db.prepare(`
      INSERT INTO recipes (id, user_id, name, description, image_url, is_public, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    await stmt.bind(
      id,
      userId,
      recipe.name,
      recipe.description || null,
      recipe.imageUrl || null,
      recipe.isPublic ? 1 : 0,
      now,
      now
    ).run()

    return this.getRecipeById(id, userId) as Promise<Recipe>
  }

  async getRecipes(userId: string): Promise<Recipe[]> {
    const stmt = this.db.prepare('SELECT * FROM recipes WHERE user_id = ? ORDER BY created_at DESC')
    const result = await stmt.bind(userId).all()
    
    const recipes: Recipe[] = []
    for (const row of result.results) {
      const recipe = await this.mapRowToRecipe(row)
      recipes.push(recipe)
    }
    
    return recipes
  }

  async getRecipeById(id: string, userId: string): Promise<Recipe | null> {
    const stmt = this.db.prepare('SELECT * FROM recipes WHERE id = ? AND user_id = ?')
    const result = await stmt.bind(id, userId).first()
    
    if (!result) return null
    
    return this.mapRowToRecipe(result)
  }

  async updateRecipe(id: string, updates: Partial<Recipe>, userId: string): Promise<Recipe | null> {
    const now = new Date().toISOString()
    
    const existingRecipe = await this.getRecipeById(id, userId)
    if (!existingRecipe) return null

    // Build dynamic SET clause based on provided updates
    const setClauses: string[] = []
    const params: (string | null)[] = []
    
    if ('name' in updates) {
      setClauses.push('name = ?')
      params.push(updates.name!)
    }
    
    if ('description' in updates) {
      setClauses.push('description = ?')
      params.push(updates.description || null)
    }
    
    if ('imageUrl' in updates) {
      setClauses.push('image_url = ?')
      params.push(updates.imageUrl || null)
    }
    
    if ('isPublic' in updates) {
      setClauses.push('is_public = ?')
      params.push(updates.isPublic ? 1 : 0)
    }
    
    // Always update updated_at
    setClauses.push('updated_at = ?')
    params.push(now)
    
    // Add WHERE clause params
    params.push(id, userId)
    
    const stmt = this.db.prepare(`
      UPDATE recipes 
      SET ${setClauses.join(', ')}
      WHERE id = ? AND user_id = ?
    `)
    
    await stmt.bind(...params).run()
    return this.getRecipeById(id, userId)
  }

  private async mapRowToRecipe(row: Record<string, unknown>): Promise<Recipe> {
    return {
      id: row.id as string,
      name: row.name as string,
      description: row.description as string | undefined,
      imageUrl: row.image_url as string | undefined,
      isPublic: (row.is_public as number) === 1,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string
    }
  }

  // Public recipe methods
  async getPublicRecipes(): Promise<Recipe[]> {
    const stmt = this.db.prepare('SELECT * FROM recipes WHERE is_public = 1 ORDER BY created_at DESC')
    const result = await stmt.all()
    const recipes: Recipe[] = []
    for (const row of result.results) {
      const recipe = await this.mapRowToRecipe(row)
      recipes.push(recipe)
    }
    return recipes
  }

  async getPublicRecipeById(id: string): Promise<Recipe | null> {
    const stmt = this.db.prepare('SELECT * FROM recipes WHERE id = ? AND is_public = 1')
    const result = await stmt.bind(id).first()
    if (!result) return null
    return this.mapRowToRecipe(result)
  }

  async importPublicRecipe(id: string, userId: string): Promise<Recipe | null> {
    const publicRecipe = await this.getPublicRecipeById(id)
    if (!publicRecipe) return null
    return this.createRecipe(
      {
        name: publicRecipe.name,
        description: publicRecipe.description,
        imageUrl: publicRecipe.imageUrl,
        isPublic: false,
      },
      userId
    )
  }

  // Meal methods
  async createMeal(meal: CreateMealRequest, userId: string): Promise<Meal> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    
    const stmt = this.db.prepare(`
      INSERT INTO meals (id, user_id, date, meal_type, recipe_id, custom_food_name, portion, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    await stmt.bind(
      id,
      userId,
      meal.date,
      meal.mealType,
      meal.recipeId || null,
      meal.customFoodName || null,
      meal.portion,
      meal.notes || null,
      now
    ).run()

    return this.getMealById(id, userId) as Promise<Meal>
  }

  async getMeals(userId: string, startDate?: string, endDate?: string): Promise<Meal[]> {
    let query = 'SELECT * FROM meals WHERE user_id = ?'
    const params: string[] = [userId]
    
    if (startDate || endDate) {
      if (startDate && endDate) {
        query += ' AND date >= ? AND date <= ?'
        params.push(startDate, endDate)
      } else if (startDate) {
        query += ' AND date >= ?'
        params.push(startDate)
      } else if (endDate) {
        query += ' AND date <= ?'
        params.push(endDate)
      }
    }
    
    query += ' ORDER BY date DESC, created_at DESC'
    
    const stmt = this.db.prepare(query)
    const result = await stmt.bind(...params).all()
    
    const meals: Meal[] = []
    for (const row of result.results) {
      const meal = await this.mapRowToMeal(row, userId)
      meals.push(meal)
    }
    
    return meals
  }

  async getMealById(id: string, userId: string): Promise<Meal | null> {
    const stmt = this.db.prepare('SELECT * FROM meals WHERE id = ? AND user_id = ?')
    const result = await stmt.bind(id, userId).first()
    
    if (!result) return null
    
    return this.mapRowToMeal(result, userId)
  }

  async updateMeal(id: string, updates: Partial<Meal>, userId: string): Promise<Meal | null> {
    const existingMeal = await this.getMealById(id, userId)
    if (!existingMeal) return null

    // Build dynamic SET clause based on provided updates
    const setClauses: string[] = []
    const params: (string | number | null)[] = []
    
    if ('date' in updates) {
      setClauses.push('date = ?')
      params.push(updates.date!)
    }
    
    if ('mealType' in updates) {
      setClauses.push('meal_type = ?')
      params.push(updates.mealType!)
    }
    
    if ('recipeId' in updates) {
      setClauses.push('recipe_id = ?')
      params.push(updates.recipeId || null)
    }
    
    if ('customFoodName' in updates) {
      setClauses.push('custom_food_name = ?')
      params.push(updates.customFoodName || null)
    }
    
    if ('portion' in updates) {
      setClauses.push('portion = ?')
      params.push(updates.portion!)
    }
    
    if ('notes' in updates) {
      setClauses.push('notes = ?')
      params.push(updates.notes || null)
    }
    
    // Add WHERE clause params
    params.push(id, userId)
    
    const stmt = this.db.prepare(`
      UPDATE meals 
      SET ${setClauses.join(', ')}
      WHERE id = ? AND user_id = ?
    `)
    
    await stmt.bind(...params).run()
    return this.getMealById(id, userId)
  }

  private async mapRowToMeal(row: Record<string, unknown>, userId: string): Promise<Meal> {
    let recipe: Recipe | undefined
    if (row.recipe_id) {
      recipe = await this.getRecipeById(row.recipe_id as string, userId) || undefined
    }

    return {
      id: row.id as string,
      date: row.date as string,
      mealType: row.meal_type as "breakfast" | "lunch" | "dinner" | "snack",
      recipeId: row.recipe_id as string | undefined,
      recipe,
      customFoodName: row.custom_food_name as string | undefined,
      portion: row.portion as number,
      notes: row.notes as string | undefined,
      createdAt: row.created_at as string
    }
  }

  // Analytics methods
  async getAnalytics(userId: string, startDate?: string, endDate?: string): Promise<MealAnalytics> {
    const meals = await this.getMeals(userId, startDate, endDate)
    
    // Total meals
    const totalMeals = meals.length

    // Favorite recipes
    const recipeCounts = new Map<string, { recipe: Recipe; count: number }>()
    
    for (const meal of meals) {
      if (meal.recipe) {
        const existing = recipeCounts.get(meal.recipe.id)
        if (existing) {
          existing.count++
        } else {
          recipeCounts.set(meal.recipe.id, { recipe: meal.recipe, count: 1 })
        }
      }
    }
    
    const favoriteRecipes = Array.from(recipeCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Meals by type
    const mealsByType: Record<string, number> = {}
    for (const meal of meals) {
      mealsByType[meal.mealType] = (mealsByType[meal.mealType] || 0) + 1
    }

    // For now, top ingredients will be empty since we removed ingredients
    const topIngredients: Array<{ ingredient: string; frequency: number }> = []

    return {
      totalMeals,
      favoriteRecipes,
      mealsByType,
      topIngredients
    }
  }
}
