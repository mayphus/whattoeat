import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { Recipe } from '../types'
import { recipeApi } from '../services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@clerk/clerk-react'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { getToken } = useAuth()

  useEffect(() => {
    if (id) {
      loadRecipe(id)
    }
  }, [id])

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

  const handleSave = async () => {
    if (!recipe || !id) return
    
    try {
      setIsSaving(true)
      const token = await getToken()
      await recipeApi.update(id, recipe, token)
      setIsEditing(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave()
    } else {
      setIsEditing(true)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading recipe...</p>
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
        {recipe.imageUrl && (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div>
            {isEditing ? (
              <Input 
                type="text" 
                value={recipe.name}
                onChange={(e) => setRecipe(prev => prev ? {...prev, name: e.target.value} : prev)}
                className="text-3xl font-semibold mb-2 border-0 border-b rounded-none px-0 focus:border-primary"
              />
            ) : (
              <h1 className="text-3xl font-semibold mb-2">{recipe.name}</h1>
            )}
            {recipe.description && (
              isEditing ? (
                <Input
                  value={recipe.description}
                  onChange={(e) => setRecipe(prev => prev ? {...prev, description: e.target.value} : prev)}
                  className="text-muted-foreground text-lg border-0 border-b rounded-none px-0 focus:border-primary"
                />
              ) : (
                <p className="text-muted-foreground text-lg">{recipe.description}</p>
              )
            )}
          </div>
          
          <div>
            <Button
              onClick={handleEditToggle}
              variant="secondary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
