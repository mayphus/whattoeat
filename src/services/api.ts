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

// Function to get the Clerk session token
async function getAuthToken(): Promise<string | null> {
  // This will be dynamically imported to avoid issues during build
  try {
    const { useAuth } = await import('@clerk/clerk-react')
    // Note: In practice, this should be called within a component/hook context
    // For now, we'll handle this in the components that make API calls
    return null
  } catch {
    return null
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers,
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
  async getAll(token?: string | null): Promise<Recipe[]> {
    return request<Recipe[]>('/recipes', {}, token)
  },

  async getById(id: string, token?: string | null): Promise<Recipe> {
    return request<Recipe>(`/recipes/${id}`, {}, token)
  },

  async create(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>, token?: string | null): Promise<Recipe> {
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

  async create(meal: Omit<Meal, 'id' | 'createdAt'>, token?: string | null): Promise<Meal> {
    return request<Meal>('/meals', {
      method: 'POST',
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
  async upload(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData()
    formData.append("image", file)
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
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
