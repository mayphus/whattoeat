import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { recipeApi } from '../services/api'
import RecipeForm from '../components/RecipeForm'
import { useAuth } from '@clerk/clerk-react'
export default function NewRecipePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuth()

  const handleSubmit = async (data: { name: string; description?: string; imageUrl?: string; isPublic?: boolean }) => {
    if (!data.name?.trim()) {
      setError('Please enter recipe name')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const token = await getToken()
      await recipeApi.create(data, token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  return (
    <RecipeForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      loading={loading}
      error={error}
      submitLabel="Create Recipe"
      title="Add Recipe"
    />
  )
}
