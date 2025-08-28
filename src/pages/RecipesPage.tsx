import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Recipe } from '../types'
import { recipeApi } from '../services/api'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      const data = await recipeApi.getAll()
      setRecipes(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading recipes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error}</p>
        <button 
          onClick={loadRecipes}
          className="btn btn-secondary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-12">
        <h1>Recipes</h1>
        <Link to="/recipes/new" className="btn btn-primary btn-large">
          Add Recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🍳</div>
          <h2 className="mb-8">No recipes yet</h2>
          <Link to="/recipes/new" className="btn btn-primary btn-large">
            Add Your First Recipe
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 grid-md-2 grid-lg-3 gap-8">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}

interface RecipeCardProps {
  recipe: Recipe
}

function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <Link to={`/recipes/${recipe.id}`} className="block group">
      <div className="card card-interactive">
        {recipe.imageUrl ? (
          <div className="relative overflow-hidden rounded-xl mb-6 -mx-2 -mt-2">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.name}
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl mb-6 -mx-2 -mt-2 flex items-center justify-center">
            <span className="text-4xl opacity-60">🍽️</span>
          </div>
        )}
        
        <div className="space-y-3">
          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-200">
            {recipe.name}
          </h3>
        
          {recipe.description && (
            <p className="text-neutral-600 text-sm leading-relaxed line-clamp-2">
              {recipe.description}
            </p>
          )}
        
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span className="flex items-center gap-1">
              ⏱️ {totalTime} min
            </span>
            <span className="flex items-center gap-1">
              👥 {recipe.servings}
            </span>
            <span className={`capitalize px-2 py-1 rounded-full text-xs font-medium ${
              recipe.difficulty === 'easy' 
                ? 'bg-green-100 text-green-700' 
                : recipe.difficulty === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {recipe.difficulty}
            </span>
          </div>
        
          <div>
            <span className="inline-block bg-warm-100 text-primary text-xs font-medium px-3 py-1 rounded-full capitalize">
              {recipe.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}