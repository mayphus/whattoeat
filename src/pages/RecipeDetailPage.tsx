import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Recipe } from '../types'
import { recipeApi } from '../services/api'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadRecipe(id)
    }
  }, [id])

  const loadRecipe = async (recipeId: string) => {
    try {
      setLoading(true)
      const data = await recipeApi.getById(recipeId)
      setRecipe(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading recipe...</p>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error || 'Recipe not found'}</p>
        <Link to="/" className="btn btn-secondary">
          Back to Recipes
        </Link>
      </div>
    )
  }

  const totalTime = recipe.prepTime + recipe.cookTime
  const hasNutrition = recipe.nutrition && (
    recipe.nutrition.calories ||
    recipe.nutrition.protein ||
    recipe.nutrition.carbs ||
    recipe.nutrition.fat ||
    recipe.nutrition.fiber
  )

  return (
    <div className="container-sm">
      <div className="mb-6">
        <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to Recipes
        </Link>
      </div>

      <div className="mb-8">
        {recipe.imageUrl && (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold mb-2">{recipe.name}</h1>
            {recipe.description && (
              <p className="text-gray-600 text-lg">{recipe.description}</p>
            )}
          </div>
          
          <Link
            to={`/meals/new?recipeId=${recipe.id}`}
            className="btn btn-primary"
          >
            Log as Meal
          </Link>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-medium">Prep:</span>
            <span>{recipe.prepTime} min</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Cook:</span>
            <span>{recipe.cookTime} min</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Total:</span>
            <span>{totalTime} min</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Servings:</span>
            <span>{recipe.servings}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Difficulty:</span>
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
        </div>

        <div className="mb-6">
          <span className="inline-block bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
            {recipe.category}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 grid-lg-3 gap-8">
        <div className="grid-lg-2">
          {/* Ingredients */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
            <div className="card">
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient.id} className="flex items-center justify-between">
                    <span className="font-medium">{ingredient.name}</span>
                    <span className="text-gray-600">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="card">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="flex-1 leading-relaxed">{instruction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {/* Nutrition */}
          {hasNutrition && (
            <div className="card mb-6">
              <h3 className="text-lg font-medium mb-4">Nutrition (per serving)</h3>
              <div className="space-y-3">
                {recipe.nutrition?.calories && (
                  <div className="flex items-center justify-between">
                    <span>Calories</span>
                    <span className="font-medium">{recipe.nutrition.calories}</span>
                  </div>
                )}
                {recipe.nutrition?.protein && (
                  <div className="flex items-center justify-between">
                    <span>Protein</span>
                    <span className="font-medium">{recipe.nutrition.protein}g</span>
                  </div>
                )}
                {recipe.nutrition?.carbs && (
                  <div className="flex items-center justify-between">
                    <span>Carbs</span>
                    <span className="font-medium">{recipe.nutrition.carbs}g</span>
                  </div>
                )}
                {recipe.nutrition?.fat && (
                  <div className="flex items-center justify-between">
                    <span>Fat</span>
                    <span className="font-medium">{recipe.nutrition.fat}g</span>
                  </div>
                )}
                {recipe.nutrition?.fiber && (
                  <div className="flex items-center justify-between">
                    <span>Fiber</span>
                    <span className="font-medium">{recipe.nutrition.fiber}g</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recipe Info */}
          <div className="card">
            <h3 className="text-lg font-medium mb-4">Recipe Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Created</span>
                <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span>{new Date(recipe.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Recipe ID</span>
                <span className="font-mono text-xs">{recipe.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}