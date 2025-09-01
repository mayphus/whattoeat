import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { Recipe } from '../types'
import { recipeApi } from '../services/api'
import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/clerk-react'
import RecipeForm from '../components/RecipeForm'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { isLoaded, isSignedIn, getToken } = useAuth()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    if (id) {
      loadRecipe(id)
    }
  }, [id, isLoaded, isSignedIn])

  const loadRecipe = async (recipeId: string) => {
    try {
      setLoading(true)
      const token = await getToken()
      const data = await recipeApi.getById(recipeId, token)
      setRecipe(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (updates: { name: string; description?: string; imageUrl?: string }) => {
    if (!recipe || !id) return
    
    try {
      setIsSaving(true)
      const token = await getToken()
      
      await recipeApi.update(id, updates, token)
      setIsEditing(false)
      setError(null)
      
      // Refresh the recipe data to get the updated version
      await loadRecipe(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError(null)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading recipe...</p>
      </div>
    )
  }

  if (error && !recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error || 'Recipe not found'}</p>
        <Link to="/" className="btn btn-secondary">
          Back to Recipes
        </Link>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">Recipe not found</p>
        <Link to="/" className="btn btn-secondary">
          Back to Recipes
        </Link>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div>
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Link>
          </Button>
        </div>
        
        <RecipeForm
          recipe={recipe}
          onSubmit={handleSave}
          onCancel={handleCancel}
          loading={isSaving}
          error={error}
          submitLabel="Save Changes"
          title="Edit Recipe"
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
            <p className="text-gray-500 italic">No image yet</p>
          </div>
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold mb-2">{recipe.name}</h1>
            {recipe.description ? (
              <p className="text-muted-foreground text-lg">{recipe.description}</p>
            ) : (
              <p className="text-muted-foreground text-lg italic">No description yet</p>
            )}
          </div>
          
          <div>
            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
            >
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
