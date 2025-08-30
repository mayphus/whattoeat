import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { format, startOfDay, endOfDay } from 'date-fns'
import { AlertCircle, Clock } from 'lucide-react'
import type { Meal } from '../types'
import { mealApi } from '../services/api'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const { getToken } = useAuth()

  const loadMeals = useCallback(async () => {
    try {
      setLoading(true)
      const startDate = format(startOfDay(new Date(selectedDate)), 'yyyy-MM-dd')
      const endDate = format(endOfDay(new Date(selectedDate)), 'yyyy-MM-dd')
      const token = await getToken()
      const data = await mealApi.getAll(startDate, endDate, token)
      setMeals(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meal records')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, getToken])

  useEffect(() => {
    loadMeals()
  }, [loadMeals])

  const mealsByType = meals.reduce((acc, meal) => {
    if (!acc[meal.mealType]) {
      acc[meal.mealType] = []
    }
    acc[meal.mealType].push(meal)
    return acc
  }, {} as Record<string, Meal[]>)

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading meal records...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadMeals} variant="secondary">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {meals.length === 0 ? (
            <>
              <div className="flex justify-end mb-8">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="min-h-[50vh] flex items-center justify-center">
                <Button asChild size="lg">
                  <Link to="/meals/new">
                    Record Meal
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col space-y-4 mb-8">
                <h1 className="text-2xl font-semibold">Meal Records</h1>
                <div className="flex justify-center items-center gap-4">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                  <Button asChild>
                    <Link to="/meals/new">
                      Record Meal
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-medium text-muted-foreground">
                  {format(new Date(selectedDate), 'MMMM d, yyyy')}
                </h2>
              </div>
              <div className="grid gap-8">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
                  <MealTypeSection
                    key={mealType}
                    mealType={mealType}
                    meals={mealsByType[mealType] || []}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

interface MealTypeSectionProps {
  mealType: string
  meals: Meal[]
}

function MealTypeSection({ mealType, meals }: MealTypeSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-medium capitalize mb-4">
        {mealType === 'breakfast' ? 'Breakfast' : mealType === 'lunch' ? 'Lunch' : mealType === 'dinner' ? 'Dinner' : 'Snack'}
      </h3>
      
      {meals.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">
              No {mealType === 'breakfast' ? 'breakfast' : mealType === 'lunch' ? 'lunch' : mealType === 'dinner' ? 'dinner' : 'snack'} records yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </div>
  )
}

interface MealCardProps {
  meal: Meal
}

function MealCard({ meal }: MealCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {meal.recipe ? (
              <div>
                <Link 
                  to={`/recipes/${meal.recipe.id}`}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {meal.recipe.name}
                </Link>
                {meal.portion !== 1 && (
                  <span className="text-muted-foreground ml-2">
                    ({meal.portion}x portion)
                  </span>
                )}
              </div>
            ) : (
              <h4 className="text-lg font-medium">{meal.customFoodName}</h4>
            )}

            {meal.notes && (
              <p className="text-muted-foreground text-sm mt-2">{meal.notes}</p>
            )}

            {meal.recipe && (
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {meal.recipe.prepTime + meal.recipe.cookTime} min
                </div>
                <span className="capitalize">{meal.recipe.difficulty}</span>
                {meal.recipe.nutrition?.calories && (
                  <span>{Math.round(meal.recipe.nutrition.calories * meal.portion)} cal</span>
                )}
              </div>
            )}
          </div>

          <div className="text-right text-sm text-muted-foreground">
            {format(new Date(meal.createdAt), 'h:mm a')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
