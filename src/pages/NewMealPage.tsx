import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import type { Recipe } from '../types'
import { recipeApi, mealApi } from '../services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@clerk/clerk-react'

export default function NewMealPage() {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    mealType: 'breakfast' as const,
    recipeId: '',
    customFoodName: '',
    portion: 1,
    notes: '',
  })

  const [useCustomFood, setUseCustomFood] = useState(false)

  const loadRecipes = useCallback(async () => {
    try {
      const token = await getToken()
      const data = await recipeApi.getAll(token)
      setRecipes(data)
    } catch (err) {
      console.error('Failed to load recipes:', err)
    }
  }, [getToken])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    loadRecipes()
  }, [isLoaded, isSignedIn, loadRecipes])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!useCustomFood && !formData.recipeId) {
      setError('Please select a recipe or enter custom food')
      return
    }

    if (useCustomFood && !formData.customFoodName.trim()) {
      setError('Please enter food name')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const meal = {
        date: formData.date,
        mealType: formData.mealType,
        recipeId: useCustomFood ? undefined : formData.recipeId,
        customFoodName: useCustomFood ? formData.customFoodName : undefined,
        portion: formData.portion,
        notes: formData.notes || undefined,
      }
      
      const token = await getToken()
      await mealApi.create(meal, token)
      navigate('/meals')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record meal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Record Meal</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mealType">Meal Type</Label>
                <Select value={formData.mealType} onValueChange={(value) => handleInputChange('mealType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-4">
              <Label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="foodType"
                  checked={!useCustomFood}
                  onChange={() => setUseCustomFood(false)}
                />
                <span>From Recipe</span>
              </Label>
              <Label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="foodType"
                  checked={useCustomFood}
                  onChange={() => setUseCustomFood(true)}
                />
                <span>Custom Food</span>
              </Label>
            </div>

            {useCustomFood ? (
              <div className="space-y-2">
                <Label htmlFor="customFoodName">Food Name</Label>
                <Input
                  type="text"
                  id="customFoodName"
                  value={formData.customFoodName}
                  onChange={(e) => handleInputChange('customFoodName', e.target.value)}
                  placeholder="e.g. Apple, Sandwich, etc."
                  required={useCustomFood}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="recipeId">Recipe</Label>
                <Select value={formData.recipeId} onValueChange={(value) => handleInputChange('recipeId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose recipe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {recipes.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    No recipes available. <Link to="/recipes/new" className="text-primary hover:underline">Create one first</Link>.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {!useCustomFood && (
          <Card>
            <CardContent className="p-6 space-y-2">
              <Label htmlFor="portion">Portion Size</Label>
              <Input
                type="number"
                id="portion"
                min="0.1"
                step="0.1"
                value={formData.portion}
                onChange={(e) => handleInputChange('portion', parseFloat(e.target.value) || 1)}
              />
              <p className="text-sm text-muted-foreground">
                1.0 = full recipe, 0.5 = half portion, and so on.
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6 space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes about this meal..."
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Recording...' : 'Record Meal'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/meals')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
