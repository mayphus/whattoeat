import { useState, useEffect } from 'react'
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
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">記錄用餐</h1>
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
                <Label htmlFor="date">日期</Label>
                <Input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mealType">用餐類型</Label>
                <Select value={formData.mealType} onValueChange={(value) => handleInputChange('mealType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">早餐</SelectItem>
                    <SelectItem value="lunch">午餐</SelectItem>
                    <SelectItem value="dinner">晚餐</SelectItem>
                    <SelectItem value="snack">點心</SelectItem>
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
                <span>來自食譜</span>
              </Label>
              <Label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="foodType"
                  checked={useCustomFood}
                  onChange={() => setUseCustomFood(true)}
                />
                <span>自定義食物</span>
              </Label>
            </div>

            {useCustomFood ? (
              <div className="space-y-2">
                <Label htmlFor="customFoodName">食物名稱</Label>
                <Input
                  type="text"
                  id="customFoodName"
                  value={formData.customFoodName}
                  onChange={(e) => handleInputChange('customFoodName', e.target.value)}
                  placeholder="例如：蘋果、三明治等"
                  required={useCustomFood}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="recipeId">食譜</Label>
                <Select value={formData.recipeId} onValueChange={(value) => handleInputChange('recipeId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇食譜..." />
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
                    沒有可用的食譜。 <Link to="/recipes/new" className="text-primary hover:underline">先創建一個</Link>。
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {!useCustomFood && (
          <Card>
            <CardContent className="p-6 space-y-2">
              <Label htmlFor="portion">份量大小</Label>
              <Input
                type="number"
                id="portion"
                min="0.1"
                step="0.1"
                value={formData.portion}
                onChange={(e) => handleInputChange('portion', parseFloat(e.target.value) || 1)}
              />
              <p className="text-sm text-muted-foreground">
                1.0 = 整份食譜，0.5 = 半份，以此類推。
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6 space-y-2">
            <Label htmlFor="notes">備註 (可選)</Label>
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="關於這餐的任何額外備註..."
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? '記錄中...' : '記錄用餐'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/meals')}>
            取消
          </Button>
        </div>
      </form>
    </div>
  )
}