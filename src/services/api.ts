import type { Recipe, Meal, MealAnalytics, ApiResponse } from '../types'

const API_BASE = '/api'

class ApiError extends Error {
  public status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new ApiError(response.status, `HTTP ${response.status}`)
  }

  const data: ApiResponse<T> = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed')
  }

  return data.data!
}

export const recipeApi = {
  async getAll(): Promise<Recipe[]> {
    return request<Recipe[]>('/recipes')
  },

  async getById(id: string): Promise<Recipe> {
    return request<Recipe>(`/recipes/${id}`)
  },

  async create(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recipe> {
    return request<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    })
  },
}

export const mealApi = {
  async getAll(startDate?: string, endDate?: string): Promise<Meal[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return request<Meal[]>(`/meals${query}`)
  },

  async getById(id: string): Promise<Meal> {
    return request<Meal>(`/meals/${id}`)
  },

  async create(meal: Omit<Meal, 'id' | 'createdAt'>): Promise<Meal> {
    return request<Meal>('/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    })
  },
}

export const analyticsApi = {
  async get(startDate?: string, endDate?: string): Promise<MealAnalytics> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return request<MealAnalytics>(`/analytics${query}`)
  },
}