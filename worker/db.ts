import { Recipe, Ingredient, Meal, MealAnalytics } from '../src/types'

export class Database {
  constructor(private db: D1Database) {}

  // Recipe methods
  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    
    const stmt = this.db.prepare(`
      INSERT INTO recipes (id, name, description, image_url, prep_time, cook_time, servings, difficulty, category, instructions, calories, protein, carbs, fat, fiber, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    await stmt.bind(
      id,
      recipe.name,
      recipe.description || null,
      recipe.imageUrl || null,
      recipe.prepTime,
      recipe.cookTime,
      recipe.servings,
      recipe.difficulty,
      recipe.category,
      JSON.stringify(recipe.instructions),
      recipe.nutrition?.calories || null,
      recipe.nutrition?.protein || null,
      recipe.nutrition?.carbs || null,
      recipe.nutrition?.fat || null,
      recipe.nutrition?.fiber || null,
      now,
      now
    ).run()

    // Insert ingredients
    for (const ingredient of recipe.ingredients) {
      const ingredientId = crypto.randomUUID()
      const ingredientStmt = this.db.prepare(`
        INSERT INTO ingredients (id, recipe_id, name, amount, unit)
        VALUES (?, ?, ?, ?, ?)
      `)
      await ingredientStmt.bind(ingredientId, id, ingredient.name, ingredient.amount, ingredient.unit).run()
    }

    return this.getRecipeById(id) as Promise<Recipe>
  }

  async getRecipes(): Promise<Recipe[]> {
    const stmt = this.db.prepare('SELECT * FROM recipes ORDER BY created_at DESC')
    const result = await stmt.all()
    
    const recipes: Recipe[] = []
    for (const row of result.results) {
      const recipe = await this.mapRowToRecipe(row)
      recipes.push(recipe)
    }
    
    return recipes
  }

  async getRecipeById(id: string): Promise<Recipe | null> {
    const stmt = this.db.prepare('SELECT * FROM recipes WHERE id = ?')
    const result = await stmt.bind(id).first()
    
    if (!result) return null
    
    return this.mapRowToRecipe(result)
  }

  private async mapRowToRecipe(row: Record<string, unknown>): Promise<Recipe> {
    // Get ingredients
    const ingredientsStmt = this.db.prepare('SELECT * FROM ingredients WHERE recipe_id = ?')
    const ingredientsResult = await ingredientsStmt.bind(row.id).all()
    
    const ingredients: Ingredient[] = ingredientsResult.results.map((ing: Record<string, unknown>) => ({
      id: ing.id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit
    }))

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      prepTime: row.prep_time,
      cookTime: row.cook_time,
      servings: row.servings,
      difficulty: row.difficulty,
      category: row.category,
      ingredients,
      instructions: JSON.parse(row.instructions),
      nutrition: {
        calories: row.calories,
        protein: row.protein,
        carbs: row.carbs,
        fat: row.fat,
        fiber: row.fiber
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }

  // Meal methods
  async createMeal(meal: Omit<Meal, 'id' | 'createdAt'>): Promise<Meal> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    
    const stmt = this.db.prepare(`
      INSERT INTO meals (id, date, meal_type, recipe_id, custom_food_name, portion, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    await stmt.bind(
      id,
      meal.date,
      meal.mealType,
      meal.recipeId || null,
      meal.customFoodName || null,
      meal.portion,
      meal.notes || null,
      now
    ).run()

    return this.getMealById(id) as Promise<Meal>
  }

  async getMeals(startDate?: string, endDate?: string): Promise<Meal[]> {
    let query = 'SELECT * FROM meals'
    const params: string[] = []
    
    if (startDate || endDate) {
      query += ' WHERE '
      if (startDate && endDate) {
        query += 'date >= ? AND date <= ?'
        params.push(startDate, endDate)
      } else if (startDate) {
        query += 'date >= ?'
        params.push(startDate)
      } else if (endDate) {
        query += 'date <= ?'
        params.push(endDate)
      }
    }
    
    query += ' ORDER BY date DESC, created_at DESC'
    
    const stmt = this.db.prepare(query)
    const result = await stmt.bind(...params).all()
    
    const meals: Meal[] = []
    for (const row of result.results) {
      const meal = await this.mapRowToMeal(row)
      meals.push(meal)
    }
    
    return meals
  }

  async getMealById(id: string): Promise<Meal | null> {
    const stmt = this.db.prepare('SELECT * FROM meals WHERE id = ?')
    const result = await stmt.bind(id).first()
    
    if (!result) return null
    
    return this.mapRowToMeal(result)
  }

  private async mapRowToMeal(row: Record<string, unknown>): Promise<Meal> {
    let recipe: Recipe | undefined
    if (row.recipe_id) {
      recipe = await this.getRecipeById(row.recipe_id) || undefined
    }

    return {
      id: row.id,
      date: row.date,
      mealType: row.meal_type,
      recipeId: row.recipe_id,
      recipe,
      customFoodName: row.custom_food_name,
      portion: row.portion,
      notes: row.notes,
      createdAt: row.created_at
    }
  }

  // Analytics methods
  async getAnalytics(startDate?: string, endDate?: string): Promise<MealAnalytics> {
    const meals = await this.getMeals(startDate, endDate)
    
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

    // Nutrition trends (simplified for now)
    const nutritionTrends = meals
      .filter(meal => meal.recipe?.nutrition)
      .map(meal => ({
        date: meal.date,
        calories: (meal.recipe?.nutrition?.calories || 0) * meal.portion,
        protein: (meal.recipe?.nutrition?.protein || 0) * meal.portion,
        carbs: (meal.recipe?.nutrition?.carbs || 0) * meal.portion,
        fat: (meal.recipe?.nutrition?.fat || 0) * meal.portion
      }))

    // Top ingredients
    const ingredientCounts = new Map<string, number>()
    for (const meal of meals) {
      if (meal.recipe) {
        for (const ingredient of meal.recipe.ingredients) {
          const count = ingredientCounts.get(ingredient.name) || 0
          ingredientCounts.set(ingredient.name, count + meal.portion)
        }
      }
    }
    
    const topIngredients = Array.from(ingredientCounts.entries())
      .map(([ingredient, frequency]) => ({ ingredient, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)

    return {
      totalMeals,
      favoriteRecipes,
      mealsByType,
      nutritionTrends,
      topIngredients
    }
  }
}