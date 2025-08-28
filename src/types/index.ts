export interface Recipe {
  id: string
  name: string
  description?: string
  imageUrl?: string
  prepTime: number // minutes
  cookTime: number // minutes
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  ingredients: Ingredient[]
  instructions: string[]
  nutrition?: Nutrition
  createdAt: string
  updatedAt: string
}

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
}

export interface Nutrition {
  calories?: number
  protein?: number // grams
  carbs?: number // grams
  fat?: number // grams
  fiber?: number // grams
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
  nutritionTrends: Array<{
    date: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }>
  topIngredients: Array<{ ingredient: string; frequency: number }>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}