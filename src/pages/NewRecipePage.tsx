import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Ingredient } from '../types'
import { recipeApi } from '../services/api'
import ImageUpload from '../components/ImageUpload'

export default function NewRecipePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: 'medium' as const,
    category: 'main',
    instructions: [''],
    ingredients: [{ id: '', name: '', amount: 1, unit: '' }] as Ingredient[],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    }
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNutritionChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      nutrition: { ...prev.nutrition, [field]: value }
    }))
  }

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...formData.instructions]
    newInstructions[index] = value
    setFormData(prev => ({ ...prev, instructions: newInstructions }))
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const removeInstruction = (index: number) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, instructions: newInstructions }))
    }
  }

  const handleIngredientChange = (index: number, field: keyof Ingredient, value: string | number) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setFormData(prev => ({ ...prev, ingredients: newIngredients }))
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { id: '', name: '', amount: 1, unit: '' }]
    }))
  }

  const removeIngredient = (index: number) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, ingredients: newIngredients }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('請輸入食譜名稱')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const recipe = {
        ...formData,
        instructions: formData.instructions.filter(inst => inst.trim()),
        ingredients: formData.ingredients
          .filter(ing => ing.name.trim())
          .map(ing => ({ ...ing, id: crypto.randomUUID() }))
      }
      
      await recipeApi.create(recipe)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-sm">
      <div className="mb-8">
        <h1>新增食譜</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">基本資訊</h2>
          
          <div className="grid gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                食譜名稱 *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="我的美味食譜"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                描述
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="簡單描述你的食譜..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">
                食譜圖片
              </label>
              <ImageUpload 
                onImageUploaded={(imageUrl) => handleInputChange('imageUrl', imageUrl)}
                currentImageUrl={formData.imageUrl}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="prepTime" className="block text-sm font-medium mb-2">
                  準備時間 (分鐘)
                </label>
                <input
                  type="number"
                  id="prepTime"
                  min="0"
                  value={formData.prepTime}
                  onChange={(e) => handleInputChange('prepTime', parseInt(e.target.value) || 0)}
                />
              </div>

              <div>
                <label htmlFor="cookTime" className="block text-sm font-medium mb-2">
                  烹飪時間 (分鐘)
                </label>
                <input
                  type="number"
                  id="cookTime"
                  min="0"
                  value={formData.cookTime}
                  onChange={(e) => handleInputChange('cookTime', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="servings" className="block text-sm font-medium mb-2">
                  份量
                </label>
                <input
                  type="number"
                  id="servings"
                  min="1"
                  value={formData.servings}
                  onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium mb-2">
                  難度
                </label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                >
                  <option value="easy">簡單</option>
                  <option value="medium">中等</option>
                  <option value="hard">困難</option>
                </select>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  類別
                </label>
                <input
                  type="text"
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="main, dessert, appetizer..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">材料</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="btn btn-ghost btn-small"
            >
              + 新增材料
            </button>
          </div>

          <div className="space-y-3">
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-12 gap-3">
                <div className="col-span-1">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ingredient.amount}
                    onChange={(e) => handleIngredientChange(index, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="1"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    placeholder="杯"
                  />
                </div>
                <div className="col-span-8">
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    placeholder="材料名稱"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="btn btn-ghost btn-small text-error"
                    disabled={formData.ingredients.length === 1}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">制作步驟</h2>
            <button
              type="button"
              onClick={addInstruction}
              className="btn btn-ghost btn-small"
            >
              + 新增步驟
            </button>
          </div>

          <div className="space-y-4">
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder="描述這個步驟..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="btn btn-ghost btn-small text-error"
                  disabled={formData.instructions.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nutrition (Optional) */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">營養成分 (可選)</h2>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">熱量</label>
              <input
                type="number"
                min="0"
                value={formData.nutrition.calories}
                onChange={(e) => handleNutritionChange('calories', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">蛋白質 (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.nutrition.protein}
                onChange={(e) => handleNutritionChange('protein', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">碳水化合物 (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.nutrition.carbs}
                onChange={(e) => handleNutritionChange('carbs', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">脂肪 (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.nutrition.fat}
                onChange={(e) => handleNutritionChange('fat', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">纖維 (g)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.nutrition.fiber}
                onChange={(e) => handleNutritionChange('fiber', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? '創建中...' : '創建食譜'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  )
}