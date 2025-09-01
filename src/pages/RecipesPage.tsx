import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChefHat } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import type { Recipe } from '../types'
import { recipeApi } from '../services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isLoaded, isSignedIn, getToken } = useAuth()

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    loadRecipes()
  }, [isLoaded, isSignedIn])

  const loadRecipes = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const data = await recipeApi.getAll(token)
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
        <p className="text-muted-foreground">Loading recipes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error}</p>
        <Button 
          onClick={loadRecipes}
          variant="secondary"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div>
      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-muted-foreground mb-4">No recipes yet</p>
          <Button asChild>
            <Link to="/recipes/new">
              Add Recipe
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-8">
            <Button asChild>
              <Link to="/recipes/new">
                Add Recipe
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface RecipeCardProps {
  recipe: Recipe
}

function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link to={`/recipes/${recipe.id}`} className="block">
      <Card className="hover:shadow-sm transition-shadow">
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.name}
            className="w-full h-36 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-36 bg-muted rounded-t-lg flex items-center justify-center">
            <ChefHat className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
        
        <CardContent className="p-4 space-y-2">
          <h3 className="font-medium text-base">
            {recipe.name}
          </h3>
          
          {recipe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {recipe.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
