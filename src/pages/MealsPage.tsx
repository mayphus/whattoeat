import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { format, startOfDay, endOfDay } from 'date-fns'
import type { Meal } from '../types'
import { mealApi } from '../services/api'

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const loadMeals = useCallback(async () => {
    try {
      setLoading(true)
      const startDate = format(startOfDay(new Date(selectedDate)), 'yyyy-MM-dd')
      const endDate = format(endOfDay(new Date(selectedDate)), 'yyyy-MM-dd')
      const data = await mealApi.getAll(startDate, endDate)
      setMeals(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入用餐記錄失敗')
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

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
        <div className="text-center py-12">
          <p className="text-gray-600">載入用餐記錄中...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-error mb-4">{error}</p>
          <button onClick={loadMeals} className="btn btn-secondary">
            重試
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {meals.length === 0 ? (
            <>
              <div className="flex justify-end mb-8">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="btn btn-secondary"
                />
              </div>
              <div className="min-h-[50vh] flex items-center justify-center">
                <Link to="/meals/new" className="btn btn-primary btn-hero">
                  記錄用餐
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-8">
                <h1>用餐記錄</h1>
                <div className="flex items-center gap-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="btn btn-secondary"
                  />
                  <Link to="/meals/new" className="btn btn-primary">
                    記錄用餐
                  </Link>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-lg font-medium">
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
        {mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : mealType === 'dinner' ? '晚餐' : '點心'}
      </h3>
      
      {meals.length === 0 ? (
        <div className="card">
          <p className="text-gray-500 text-center py-4">
            尚無{mealType === 'breakfast' ? '早餐' : mealType === 'lunch' ? '午餐' : mealType === 'dinner' ? '晚餐' : '點心'}記錄
          </p>
        </div>
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
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {meal.recipe ? (
            <div>
              <Link 
                to={`/recipes/${meal.recipe.id}`}
                className="text-lg font-medium hover:text-primary"
              >
                {meal.recipe.name}
              </Link>
              {meal.portion !== 1 && (
                <span className="text-gray-500 ml-2">
                  ({meal.portion}x portion)
                </span>
              )}
            </div>
          ) : (
            <h4 className="text-lg font-medium">{meal.customFoodName}</h4>
          )}

          {meal.notes && (
            <p className="text-gray-600 text-sm mt-2">{meal.notes}</p>
          )}

          {meal.recipe && (
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <span>{meal.recipe.prepTime + meal.recipe.cookTime} min</span>
              <span className="capitalize">{meal.recipe.difficulty}</span>
              {meal.recipe.nutrition?.calories && (
                <span>{Math.round(meal.recipe.nutrition.calories * meal.portion)} cal</span>
              )}
            </div>
          )}
        </div>

        <div className="text-right text-sm text-gray-500">
          {format(new Date(meal.createdAt), 'h:mm a')}
        </div>
      </div>
    </div>
  )
}