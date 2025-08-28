import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Recipe } from '../types'
import { recipeApi, mealApi } from '../services/api'

export default function NewMealPage() {
  const navigate = useNavigate()
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

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    try {
      const data = await recipeApi.getAll()
      setRecipes(data)
    } catch (err) {
      console.error('Failed to load recipes:', err)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!useCustomFood && !formData.recipeId) {
      setError('Please select a recipe or enter a custom food')
      return
    }

    if (useCustomFood && !formData.customFoodName.trim()) {
      setError('Please enter a food name')
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
      
      await mealApi.create(meal)
      navigate('/meals')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log meal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-sm">
      <div className="mb-8">
        <h1>Log Meal</h1>
        <p className="text-gray-600">Record what you ate</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="mealType" className="block text-sm font-medium mb-2">
                Meal Type
              </label>
              <select
                id="mealType"
                value={formData.mealType}
                onChange={(e) => handleInputChange('mealType', e.target.value)}
                required
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="mb-4">
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="foodType"
                  checked={!useCustomFood}
                  onChange={() => setUseCustomFood(false)}
                  className="mr-2"
                />
                From Recipe
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="foodType"
                  checked={useCustomFood}
                  onChange={() => setUseCustomFood(true)}
                  className="mr-2"
                />
                Custom Food
              </label>
            </div>
          </div>

          {useCustomFood ? (
            <div>
              <label htmlFor="customFoodName" className="block text-sm font-medium mb-2">
                Food Name
              </label>
              <input
                type="text"
                id="customFoodName"
                value={formData.customFoodName}
                onChange={(e) => handleInputChange('customFoodName', e.target.value)}
                placeholder="e.g., Apple, Sandwich, etc."
                required={useCustomFood}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="recipeId" className="block text-sm font-medium mb-2">
                Recipe
              </label>
              <select
                id="recipeId"
                value={formData.recipeId}
                onChange={(e) => handleInputChange('recipeId', e.target.value)}
                required={!useCustomFood}
              >
                <option value="">Select a recipe...</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
              
              {recipes.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  No recipes available. <a href="/recipes/new" className="text-primary">Create one first</a>.
                </p>
              )}
            </div>
          )}
        </div>

        {!useCustomFood && (
          <div className="card">
            <label htmlFor="portion" className="block text-sm font-medium mb-2">
              Portion Size
            </label>
            <input
              type="number"
              id="portion"
              min="0.1"
              step="0.1"
              value={formData.portion}
              onChange={(e) => handleInputChange('portion', parseFloat(e.target.value) || 1)}
            />
            <p className="text-sm text-gray-500 mt-1">
              1.0 = full recipe serving, 0.5 = half serving, etc.
            </p>
          </div>
        )}

        <div className="card">
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any additional notes about this meal..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Logging...' : 'Log Meal'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/meals')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}