import { describe, it, expect, beforeEach, vi } from 'vitest'
import { recipeApi, mealApi, analyticsApi } from '../api'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Services', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('recipeApi', () => {
    it('should fetch all recipes', async () => {
      const mockRecipes = [
        { id: '1', name: 'Test Recipe', ingredients: [], instructions: [] }
      ]
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockRecipes })
      })

      const result = await recipeApi.getAll()
      
      expect(mockFetch).toHaveBeenCalledWith('/api/recipes', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toEqual(mockRecipes)
    })

    it('should create a new recipe', async () => {
      const newRecipe = {
        name: 'New Recipe',
        ingredients: [],
        instructions: ['Step 1'],
        prepTime: 10,
        cookTime: 20,
        servings: 2,
        difficulty: 'medium' as const,
        category: 'main'
      }

      const createdRecipe = { ...newRecipe, id: '123' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: createdRecipe })
      })

      const result = await recipeApi.create(newRecipe)

      expect(mockFetch).toHaveBeenCalledWith('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecipe)
      })
      expect(result).toEqual(createdRecipe)
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(recipeApi.getAll()).rejects.toThrow('HTTP 500')
    })
  })

  describe('mealApi', () => {
    it('should fetch meals with date filters', async () => {
      const mockMeals = [
        { id: '1', date: '2024-01-01', mealType: 'breakfast', portion: 1 }
      ]
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockMeals })
      })

      const result = await mealApi.getAll('2024-01-01', '2024-01-31')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/meals?startDate=2024-01-01&endDate=2024-01-31', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toEqual(mockMeals)
    })

    it('should create a meal', async () => {
      const newMeal = {
        date: '2024-01-01',
        mealType: 'breakfast' as const,
        recipeId: 'recipe-1',
        portion: 1
      }

      const createdMeal = { ...newMeal, id: 'meal-1' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: createdMeal })
      })

      const result = await mealApi.create(newMeal)

      expect(mockFetch).toHaveBeenCalledWith('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeal)
      })
      expect(result).toEqual(createdMeal)
    })
  })

  describe('analyticsApi', () => {
    it('should fetch analytics data', async () => {
      const mockAnalytics = {
        totalMeals: 10,
        favoriteRecipes: [],
        mealsByType: { breakfast: 5 },
        nutritionTrends: [],
        topIngredients: []
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockAnalytics })
      })

      const result = await analyticsApi.get('2024-01-01', '2024-01-31')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/analytics?startDate=2024-01-01&endDate=2024-01-31', {
        headers: { 'Content-Type': 'application/json' }
      })
      expect(result).toEqual(mockAnalytics)
    })
  })
})