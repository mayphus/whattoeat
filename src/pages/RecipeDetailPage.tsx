import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, Users, ArrowLeft } from 'lucide-react'
import type { Recipe } from '../types'
import { recipeApi } from '../services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  const handleSave = async () => {
    if (!recipe || !id) return
    
    try {
      setIsSaving(true)
      await recipeApi.update(id, recipe)
      setIsEditing(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存失敗')
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
        <p className="text-muted-foreground">載入食譜中...</p>
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回食譜列表
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
                <Textarea
                  value={recipe.description}
                  onChange={(e) => setRecipe(prev => prev ? {...prev, description: e.target.value} : prev)}
                  className="text-muted-foreground text-lg border-0 border-b rounded-none px-0 focus:border-primary resize-none"
                  rows={2}
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
              {isSaving ? '儲存中...' : isEditing ? '儲存' : '編輯'}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">準備:</span>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={recipe.prepTime}
                  onChange={(e) => setRecipe(prev => prev ? {...prev, prepTime: parseInt(e.target.value) || 0} : prev)}
                  className="w-16 h-6 text-sm"
                  min="0"
                />
                <span className="text-xs">分鐘</span>
              </div>
            ) : (
              <span>{recipe.prepTime} 分鐘</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">烹調:</span>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={recipe.cookTime}
                  onChange={(e) => setRecipe(prev => prev ? {...prev, cookTime: parseInt(e.target.value) || 0} : prev)}
                  className="w-16 h-6 text-sm"
                  min="0"
                />
                <span className="text-xs">分鐘</span>
              </div>
            ) : (
              <span>{recipe.cookTime} 分鐘</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">總時間:</span>
            <span>{totalTime} 分鐘</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="font-medium">份量:</span>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={recipe.servings}
                  onChange={(e) => setRecipe(prev => prev ? {...prev, servings: parseInt(e.target.value) || 1} : prev)}
                  className="w-16 h-6 text-sm"
                  min="1"
                />
                <span className="text-xs">人份</span>
              </div>
            ) : (
              <span>{recipe.servings} 人份</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">難度:</span>
            {isEditing ? (
              <select
                value={recipe.difficulty}
                onChange={(e) => setRecipe(prev => prev ? {...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard'} : prev)}
                className="text-sm border rounded px-2 py-1 bg-background"
              >
                <option value="easy">簡單</option>
                <option value="medium">中等</option>
                <option value="hard">困難</option>
              </select>
            ) : (
              <span className="capitalize">
                {recipe.difficulty === 'easy' ? '簡單' : recipe.difficulty === 'medium' ? '中等' : '困難'}
              </span>
            )}
          </div>
        </div>

        <div className="mb-6">
          {isEditing ? (
            <Input
              type="text"
              value={recipe.category}
              onChange={(e) => setRecipe(prev => prev ? {...prev, category: e.target.value} : prev)}
              className="max-w-xs"
              placeholder="食譜類別"
            />
          ) : (
            <span className="inline-block bg-muted text-foreground text-sm px-3 py-1 rounded-full">
              {recipe.category}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-8">
        <div>
          {/* Ingredients */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">食材</h2>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={ingredient.id} className="flex items-center justify-between">
                    {isEditing ? (
                      <>
                        <Input 
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => {
                            const newIngredients = [...recipe.ingredients]
                            newIngredients[index] = {...ingredient, name: e.target.value}
                            setRecipe(prev => prev ? {...prev, ingredients: newIngredients} : prev)
                          }}
                          className="font-medium border-0 border-b rounded-none px-0 focus:border-primary flex-1 mr-4"
                        />
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number"
                            value={ingredient.amount}
                            onChange={(e) => {
                              const newIngredients = [...recipe.ingredients]
                              newIngredients[index] = {...ingredient, amount: parseFloat(e.target.value) || 0}
                              setRecipe(prev => prev ? {...prev, ingredients: newIngredients} : prev)
                            }}
                            className="w-16 border-0 border-b rounded-none px-0 focus:border-primary text-center"
                          />
                          <Input 
                            type="text"
                            value={ingredient.unit}
                            onChange={(e) => {
                              const newIngredients = [...recipe.ingredients]
                              newIngredients[index] = {...ingredient, unit: e.target.value}
                              setRecipe(prev => prev ? {...prev, ingredients: newIngredients} : prev)
                            }}
                            className="w-16 border-0 border-b rounded-none px-0 focus:border-primary text-center"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">{ingredient.name}</span>
                        <span className="text-muted-foreground">
                          {ingredient.amount} {ingredient.unit}
                        </span>
                      </>
                    )}
                  </li>
                ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">烹調步驟</h2>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    {isEditing ? (
                      <Textarea
                        value={instruction}
                        onChange={(e) => {
                          const newInstructions = [...recipe.instructions]
                          newInstructions[index] = e.target.value
                          setRecipe(prev => prev ? {...prev, instructions: newInstructions} : prev)
                        }}
                        className="flex-1 leading-relaxed border-0 border-b rounded-none px-0 focus:border-primary resize-none"
                        rows={2}
                      />
                    ) : (
                      <p className="flex-1 leading-relaxed">{instruction}</p>
                    )}
                    </div>
                  </CardContent>
                </Card>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">食譜資訊</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">建立日期</span>
                <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">最後更新</span>
                <span>{new Date(recipe.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">食譜 ID</span>
                <span className="font-mono text-xs">{recipe.id}</span>
              </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}