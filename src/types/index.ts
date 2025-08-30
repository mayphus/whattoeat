export interface Recipe {
  id: string
  name: string
  description?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}



export interface Meal {
  id: string
  date: string // ISO date string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  recipeId?: string
  recipe?: Recipe
  customFoodName?: string
  portion: number // multiplier for recipe servings
  notes?: string
  createdAt: string
}

export interface MealAnalytics {
  totalMeals: number
  favoriteRecipes: Array<{ recipe: Recipe; count: number }>
  mealsByType: Record<string, number>
  topIngredients: Array<{ ingredient: string; frequency: number }>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}