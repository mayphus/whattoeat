import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Recipe } from '../types'
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
      <div className="flex items-center justify-between mb-8">
        <h1>Recipes</h1>
        <Link to="/recipes/new" className="btn btn-primary">
          Add Recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No recipes yet</p>
          <Link to="/recipes/new" className="btn btn-primary">
            Create Your First Recipe
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 grid-md-2 grid-lg-3 gap-6">
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
    <Link to={`/recipes/${recipe.id}`} className="block">
      <div className="card hover:shadow-md transition-shadow">
        {recipe.imageUrl && (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        
        <h3 className="text-lg font-medium mb-2">{recipe.name}</h3>
        
        {recipe.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{totalTime} min</span>
          <span>{recipe.servings} servings</span>
          <span className="capitalize">{recipe.difficulty}</span>
        </div>
        
        <div className="mt-3">
          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {recipe.category}
          </span>
        </div>
      </div>
    </Link>
  )
}