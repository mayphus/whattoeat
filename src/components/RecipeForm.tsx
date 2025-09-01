import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import type { Recipe } from '../types'
import ImageUpload from './ImageUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RecipeFormData {
  name: string
  description?: string
  imageUrl?: string
}

interface RecipeFormProps {
  recipe?: Recipe
  onSubmit: (data: RecipeFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  error?: string | null
  submitLabel?: string
  title?: string
}

export default function RecipeForm({
  recipe,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  submitLabel = 'Save Recipe',
  title = 'Recipe Details'
}: RecipeFormProps) {
  const [formData, setFormData] = useState({
    name: recipe?.name || '',
    description: recipe?.description || '',
    imageUrl: recipe?.imageUrl || '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return
    }

    // Only include fields that have values or were changed
    const updates: RecipeFormData = { name: formData.name.trim() }
    if (formData.description.trim()) updates.description = formData.description.trim()
    if (formData.imageUrl.trim()) updates.imageUrl = formData.imageUrl.trim()

    await onSubmit(updates)
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{title}</h1>
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
                <Label htmlFor="name">Recipe Name *</Label>
                <Input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="My Delicious Recipe"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Briefly describe your recipe..."
                />
              </div>

              <div className="grid gap-2">
                <Label>Recipe Image</Label>
                <ImageUpload 
                  onImageUploaded={(imageUrl) => handleInputChange('imageUrl', imageUrl)}
                  currentImageUrl={formData.imageUrl}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading || !formData.name.trim()}>
            {loading ? 'Saving...' : submitLabel}
          </Button>
          <Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}