import type { Recipe, CreateRecipeRequest, Meal, CreateMealRequest, MealAnalytics, ApiResponse } from '../types'

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
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  // Normalize headers
  const headers = new Headers(options.headers as HeadersInit)
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    credentials: 'include',
    ...options,
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.clone().json()
      if (body?.error) message = body.error
    } catch {}
    throw new ApiError(response.status, message)
  }

  const data: ApiResponse<T> = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'API request failed')
  }

  return data.data!
}

export const recipeApi = {
  async getAll(token?: string | null): Promise<Recipe[]> {
    return request<Recipe[]>('/recipes', {}, token)
  },

  async getById(id: string, token?: string | null): Promise<Recipe> {
    return request<Recipe>(`/recipes/${id}`, {}, token)
  },

  async create(recipe: CreateRecipeRequest, token?: string | null): Promise<Recipe> {
    return request<Recipe>('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipe),
    }, token)
  },

  async update(id: string, recipe: Partial<Recipe>, token?: string | null): Promise<Recipe> {
    return request<Recipe>(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipe),
    }, token)
  },
}

export const mealApi = {
  async getAll(startDate?: string, endDate?: string, token?: string | null): Promise<Meal[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return request<Meal[]>(`/meals${query}`, {}, token)
  },

  async getById(id: string, token?: string | null): Promise<Meal> {
    return request<Meal>(`/meals/${id}`, {}, token)
  },

  async create(meal: CreateMealRequest, token?: string | null): Promise<Meal> {
    return request<Meal>('/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
    }, token)
  },

  async update(id: string, meal: Partial<Meal>, token?: string | null): Promise<Meal> {
    return request<Meal>(`/meals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meal),
    }, token)
  },
}

export const analyticsApi = {
  async get(startDate?: string, endDate?: string, token?: string | null): Promise<MealAnalytics> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const query = params.toString() ? `?${params.toString()}` : ''
    return request<MealAnalytics>(`/analytics${query}`, {}, token)
  },
}

export const imageApi = {
  async upload(file: File, token?: string | null): Promise<{ imageUrl: string }> {
    const formData = new FormData()
    formData.append("image", file)
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data: ApiResponse<{ imageUrl: string }> = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || "Upload failed")
    }

    return data.data!
  },
}
