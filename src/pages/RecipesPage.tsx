import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Users, ChefHat } from 'lucide-react'
import type { Recipe } from '../types'
import { recipeApi } from '../services/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
      setError(err instanceof Error ? err.message : '載入食譜失敗')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">載入食譜中...</p>
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
          重試
        </Button>
      </div>
    )
  }

  return (
    <div>
      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <p className="text-muted-foreground mb-4">還沒有食譜</p>
          <Button asChild>
            <Link to="/recipes/new">
              新增食譜
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-8">
            <Button asChild>
              <Link to="/recipes/new">
                新增食譜
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
  const totalTime = recipe.prepTime + recipe.cookTime

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
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {totalTime > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {totalTime}分鐘
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {recipe.servings}人份
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}