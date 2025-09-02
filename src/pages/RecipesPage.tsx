import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChefHat, Globe } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import type { Recipe } from '../types'
import { recipeApi } from '../services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function RecipesPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'public'>('my')
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([])
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [importingId, setImportingId] = useState<string | null>(null)
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const navigate = useNavigate()

  const loadMyRecipes = useCallback(async () => {
    if (!isSignedIn) return
    try {
      setLoading(true)
      const token = await getToken()
      const data = await recipeApi.getAll(token)
      setMyRecipes(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }, [isSignedIn, getToken])

  const loadPublicRecipes = useCallback(async () => {
    try {
      const data = await recipeApi.getAllPublic()
      setPublicRecipes(data)
    } catch (err) {
      console.error('Failed to load public recipes:', err)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    loadMyRecipes()
    loadPublicRecipes()
  }, [isLoaded, isSignedIn, loadMyRecipes, loadPublicRecipes])

  const isRecipeAlreadyImported = (publicRecipe: Recipe): boolean => {
    return myRecipes.some(userRecipe => userRecipe.name.toLowerCase() === publicRecipe.name.toLowerCase())
  }

  const handleImport = async (id: string) => {
    if (!isSignedIn) {
      navigate('/sign-in')
      return
    }
    try {
      setImportingId(id)
      const token = await getToken()
      await recipeApi.importPublic(id, token)
      await loadMyRecipes() // Reload my recipes to show the imported one
      setActiveTab('my') // Switch to my recipes tab to show the imported recipe
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import recipe')
    } finally {
      setImportingId(null)
    }
  }

  if (loading && activeTab === 'my') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading recipes...</p>
      </div>
    )
  }

  if (error && activeTab === 'my') {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error}</p>
        <Button 
          onClick={loadMyRecipes}
          variant="secondary"
        >
          Retry
        </Button>
      </div>
    )
  }

  // Note: computed list not used currently
  // const currentRecipes = activeTab === 'my' ? myRecipes : publicRecipes

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'my'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          My Recipes
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'public'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Public Recipes
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Content */}
      {activeTab === 'my' ? (
        <MyRecipesTab recipes={myRecipes} />
      ) : (
        <PublicRecipesTab 
          recipes={publicRecipes} 
          onImport={handleImport}
          importingId={importingId}
          isRecipeImported={isRecipeAlreadyImported}
          isSignedIn={!!isSignedIn}
        />
      )}
    </div>
  )
}

// Tab Components
interface MyRecipesTabProps {
  recipes: Recipe[]
}

function MyRecipesTab({ recipes }: MyRecipesTabProps) {
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
              <MyRecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface PublicRecipesTabProps {
  recipes: Recipe[]
  onImport: (id: string) => void
  importingId: string | null
  isRecipeImported: (recipe: Recipe) => boolean
  isSignedIn: boolean
}

function PublicRecipesTab({ recipes, onImport, importingId, isRecipeImported, isSignedIn }: PublicRecipesTabProps) {
  return (
    <div>
      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-muted-foreground mb-4">No public recipes yet</p>
          <Button asChild>
            <Link to="/recipes/new">Share your first recipe</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="flex gap-3 items-stretch">
              <div className="flex-1">
                <PublicRecipeCard recipe={recipe} />
              </div>
              <div className="flex items-center">
                {isRecipeImported(recipe) ? (
                  <Button disabled variant="outline">
                    Already Imported
                  </Button>
                ) : (
                  <Button 
                    onClick={() => onImport(recipe.id)} 
                    disabled={importingId === recipe.id || !isSignedIn}
                  >
                    {importingId === recipe.id ? 'Importing...' : 'Import'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Card Components
interface MyRecipeCardProps {
  recipe: Recipe
}

function MyRecipeCard({ recipe }: MyRecipeCardProps) {
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
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-base">
              {recipe.name}
            </h3>
            {recipe.isPublic && (
              <Globe className="h-4 w-4 text-blue-500" aria-label="Public recipe" />
            )}
          </div>
          
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

interface PublicRecipeCardProps {
  recipe: Recipe
}

function PublicRecipeCard({ recipe }: PublicRecipeCardProps) {
  return (
    <Card className="h-full">
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
        <h3 className="font-medium text-base">{recipe.name}</h3>
        {recipe.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
        )}
      </CardContent>
    </Card>
  )
}
