import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, AlertCircle } from 'lucide-react'
import type { Ingredient } from '../types'
import { recipeApi } from '../services/api'
import ImageUpload from '../components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@clerk/clerk-react'

export default function NewRecipePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuth()
  
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
      
      const token = await getToken()
      await recipeApi.create(recipe, token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">新增食譜</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">食譜名稱 *</Label>
                <Input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="我的美味食譜"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="簡單描述你的食譜..."
                />
              </div>

              <div className="grid gap-2">
                <Label>食譜圖片</Label>
                <ImageUpload 
                  onImageUploaded={(imageUrl) => handleInputChange('imageUrl', imageUrl)}
                  currentImageUrl={formData.imageUrl}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="prepTime">準備時間 (分鐘)</Label>
                  <Input
                    type="number"
                    id="prepTime"
                    min="0"
                    value={formData.prepTime || ''}
                    onChange={(e) => handleInputChange('prepTime', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cookTime">烹飪時間 (分鐘)</Label>
                  <Input
                    type="number"
                    id="cookTime"
                    min="0"
                    value={formData.cookTime || ''}
                    onChange={(e) => handleInputChange('cookTime', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="servings">份量</Label>
                  <Input
                    type="number"
                    id="servings"
                    min="1"
                    value={formData.servings || ''}
                    onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label>難度</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="選擇難度" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">簡單</SelectItem>
                      <SelectItem value="medium">中等</SelectItem>
                      <SelectItem value="hard">困難</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">類別</Label>
                  <Input
                    type="text"
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="主食, 甜點..."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">材料</h3>
              <Button
                type="button"
                onClick={addIngredient}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                新增材料
              </Button>
            </div>

            <div className="grid gap-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={ingredient.amount || ''}
                    onChange={(e) => handleIngredientChange(index, 'amount', parseFloat(e.target.value) || 0)}
                    placeholder="1"
                    className="w-16"
                  />
                  <Input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                    placeholder="杯"
                    className="w-20"
                  />
                  <Input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    placeholder="材料名稱"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    variant="ghost"
                    size="sm"
                    disabled={formData.ingredients.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">制作步驟</h3>
              <Button
                type="button"
                onClick={addInstruction}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                新增步驟
              </Button>
            </div>
            
            <div className="grid gap-4">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium mt-1">
                    {index + 1}
                  </div>
                  <Textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder="描述這個步驟..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    variant="ghost"
                    size="sm"
                    disabled={formData.instructions.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">營養成分 (可選)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>熱量</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.nutrition.calories || ''}
                  onChange={(e) => handleNutritionChange('calories', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="grid gap-2">
                <Label>蛋白質 (g)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.protein || ''}
                  onChange={(e) => handleNutritionChange('protein', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="grid gap-2">
                <Label>碳水 (g)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.nutrition.carbs || ''}
                  onChange={(e) => handleNutritionChange('carbs', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? '創建中...' : '創建食譜'}
          </Button>
          <Button type="button" onClick={() => navigate('/')} variant="outline">
            取消
          </Button>
        </div>
      </form>
    </div>
  )
}
