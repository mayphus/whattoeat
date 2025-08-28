import { useState, useEffect, useCallback } from 'react'
import { format, subWeeks, subMonths } from 'date-fns'
import { MealAnalytics } from '../types'
import { analyticsApi } from '../services/api'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<MealAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange, loadAnalytics])

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      
      let startDate: string | undefined
      const today = new Date()
      
      switch (timeRange) {
        case 'week':
          startDate = format(subWeeks(today, 1), 'yyyy-MM-dd')
          break
        case 'month':
          startDate = format(subMonths(today, 1), 'yyyy-MM-dd')
          break
        case 'all':
          startDate = undefined
          break
      }
      
      const data = await analyticsApi.get(startDate, format(today, 'yyyy-MM-dd'))
      setAnalytics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error}</p>
        <button onClick={loadAnalytics} className="btn btn-secondary">
          Try Again
        </button>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data available</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>Analytics</h1>
          <p className="text-gray-600">Insights about your eating habits</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`btn btn-small ${timeRange === 'week' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Last Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`btn btn-small ${timeRange === 'month' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Last Month
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`btn btn-small ${timeRange === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Time
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 grid-md-2 grid-lg-4 gap-6 mb-8">
        <StatCard
          title="Total Meals"
          value={analytics.totalMeals.toString()}
          subtitle="meals logged"
        />
        <StatCard
          title="Favorite Recipe"
          value={analytics.favoriteRecipes[0]?.recipe.name || 'None'}
          subtitle={analytics.favoriteRecipes[0] ? `${analytics.favoriteRecipes[0].count} times` : ''}
        />
        <StatCard
          title="Most Common Meal"
          value={
            Object.entries(analytics.mealsByType)
              .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
          }
          subtitle={
            Object.entries(analytics.mealsByType)
              .sort(([,a], [,b]) => b - a)[0]?.[1].toString() + ' meals' || ''
          }
        />
        <StatCard
          title="Avg Daily Calories"
          value={
            analytics.nutritionTrends.length > 0
              ? Math.round(
                  analytics.nutritionTrends.reduce((sum, day) => sum + day.calories, 0) /
                  analytics.nutritionTrends.length
                ).toString()
              : '0'
          }
          subtitle="per day"
        />
      </div>

      <div className="grid grid-cols-1 grid-lg-2 gap-8">
        {/* Favorite Recipes */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Most Cooked Recipes</h2>
          {analytics.favoriteRecipes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recipe data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.favoriteRecipes.slice(0, 5).map((item, index) => (
                <div key={item.recipe.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{item.recipe.name}</p>
                      <p className="text-sm text-gray-500">{item.recipe.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.count}</p>
                    <p className="text-xs text-gray-500">times</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meals by Type */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Meals by Type</h2>
          {Object.keys(analytics.mealsByType).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No meal data available</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(analytics.mealsByType)
                .sort(([,a], [,b]) => b - a)
                .map(([mealType, count]) => (
                  <div key={mealType} className="flex items-center justify-between">
                    <span className="capitalize font-medium">{mealType}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-900 h-2 rounded-full"
                          style={{
                            width: `${(count / analytics.totalMeals) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Top Ingredients */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Most Used Ingredients</h2>
          {analytics.topIngredients.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No ingredient data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.topIngredients.slice(0, 8).map((item, index) => (
                <div key={item.ingredient} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{item.ingredient}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {item.frequency.toFixed(1)}x
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nutrition Overview */}
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Nutrition Overview</h2>
          {analytics.nutritionTrends.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No nutrition data available</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Calories', key: 'calories' as const, unit: '' },
                { label: 'Protein', key: 'protein' as const, unit: 'g' },
                { label: 'Carbs', key: 'carbs' as const, unit: 'g' },
                { label: 'Fat', key: 'fat' as const, unit: 'g' },
              ].map(({ label, key, unit }) => {
                const avg = analytics.nutritionTrends.reduce((sum, day) => sum + day[key], 0) / analytics.nutritionTrends.length
                const max = Math.max(...analytics.nutritionTrends.map(day => day[key]))
                
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-sm text-gray-600">
                        {Math.round(avg)}{unit} avg
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gray-900 h-2 rounded-full"
                        style={{ width: max > 0 ? `${(avg / max) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  subtitle: string
}

function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="card text-center">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-2xl font-semibold mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}