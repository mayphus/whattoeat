import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import RecipesPage from '../RecipesPage'
import * as api from '../../services/api'

// Mock the API
vi.mock('../../services/api')

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('RecipesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state initially', () => {
    vi.mocked(api.recipeApi.getAll).mockImplementation(() => new Promise(() => {}))
    
    renderWithRouter(<RecipesPage />)
    
    expect(screen.getByText('Loading recipes...')).toBeInTheDocument()
  })

  it('renders recipes when loaded successfully', async () => {
    const mockRecipes = [
      {
        id: '1',
        name: 'Test Recipe',
        description: 'A test recipe',
        prepTime: 10,
        cookTime: 20,
        servings: 2,
        difficulty: 'medium' as const,
        category: 'main',
        ingredients: [],
        instructions: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ]

    vi.mocked(api.recipeApi.getAll).mockResolvedValue(mockRecipes)
    
    renderWithRouter(<RecipesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument()
      expect(screen.getByText('A test recipe')).toBeInTheDocument()
      expect(screen.getByText('30 min')).toBeInTheDocument() // prep + cook time
      expect(screen.getByText('2 servings')).toBeInTheDocument()
      expect(screen.getByText('medium')).toBeInTheDocument()
    })
  })

  it('renders empty state when no recipes', async () => {
    vi.mocked(api.recipeApi.getAll).mockResolvedValue([])
    
    renderWithRouter(<RecipesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('No recipes yet')).toBeInTheDocument()
      expect(screen.getByText('Create Your First Recipe')).toBeInTheDocument()
    })
  })

  it('renders error state when API fails', async () => {
    vi.mocked(api.recipeApi.getAll).mockRejectedValue(new Error('API Error'))
    
    renderWithRouter(<RecipesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })
  })

  it('renders Add Recipe button', async () => {
    vi.mocked(api.recipeApi.getAll).mockResolvedValue([])
    
    renderWithRouter(<RecipesPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Add Recipe')).toBeInTheDocument()
      expect(screen.getByText('Add Recipe').closest('a')).toHaveAttribute('href', '/recipes/new')
    })
  })
})