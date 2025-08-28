import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import type { Recipe } from '../types'
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
      setError('請選擇食譜或輸入自定義食物')
      return
    }

    if (useCustomFood && !formData.customFoodName.trim()) {
      setError('請輸入食物名稱')
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
      setError(err instanceof Error ? err.message : '記錄用餐失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-sm">
      <div className="mb-8">
        <h1>記錄用餐</h1>
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
                日期
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
                用餐類型
              </label>
              <select
                id="mealType"
                value={formData.mealType}
                onChange={(e) => handleInputChange('mealType', e.target.value)}
                required
              >
                <option value="breakfast">早餐</option>
                <option value="lunch">午餐</option>
                <option value="dinner">晚餐</option>
                <option value="snack">點心</option>
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
                來自食譜
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="foodType"
                  checked={useCustomFood}
                  onChange={() => setUseCustomFood(true)}
                  className="mr-2"
                />
                自定義食物
              </label>
            </div>
          </div>

          {useCustomFood ? (
            <div>
              <label htmlFor="customFoodName" className="block text-sm font-medium mb-2">
                食物名稱
              </label>
              <input
                type="text"
                id="customFoodName"
                value={formData.customFoodName}
                onChange={(e) => handleInputChange('customFoodName', e.target.value)}
                placeholder="例如：蘋果、三明治等"
                required={useCustomFood}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="recipeId" className="block text-sm font-medium mb-2">
                食譜
              </label>
              <select
                id="recipeId"
                value={formData.recipeId}
                onChange={(e) => handleInputChange('recipeId', e.target.value)}
                required={!useCustomFood}
              >
                <option value="">選擇食譜...</option>
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
              
              {recipes.length === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  沒有可用的食譜。 <a href="/recipes/new" className="text-primary">先創建一個</a>。
                </p>
              )}
            </div>
          )}
        </div>

        {!useCustomFood && (
          <div className="card">
            <label htmlFor="portion" className="block text-sm font-medium mb-2">
              份量大小
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
              1.0 = 整份食譜，0.5 = 半份，以此類推。
            </p>
          </div>
        )}

        <div className="card">
          <label htmlFor="notes" className="block text-sm font-medium mb-2">
            備註 (可選)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="關於這餐的任何額外備註..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '記錄中...' : '記錄用餐'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/meals')}
            className="btn btn-secondary"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}