import { useState, useEffect, useCallback } from 'react'
import { format, subWeeks, subMonths } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import type { MealAnalytics } from '../types'
import { analyticsApi } from '../services/api'
import { useAuth } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<MealAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month')
  const { getToken } = useAuth()

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
      
      const token = await getToken()
      const data = await analyticsApi.get(startDate, format(today, 'yyyy-MM-dd'), token)
      setAnalytics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [timeRange, getToken])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadAnalytics} variant="secondary">
          Retry
        </Button>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col space-y-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="text-muted-foreground">Your eating habit insights</p>
        </div>
        
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setTimeRange('week')}
            variant={timeRange === 'week' ? 'default' : 'secondary'}
            size="sm"
          >
            Past Week
          </Button>
          <Button
            onClick={() => setTimeRange('month')}
            variant={timeRange === 'month' ? 'default' : 'secondary'}
            size="sm"
          >
            Past Month
          </Button>
          <Button
            onClick={() => setTimeRange('all')}
            variant={timeRange === 'all' ? 'default' : 'secondary'}
            size="sm"
          >
            All Time
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatCard
          title="Total Meals"
          value={analytics.totalMeals.toString()}
          subtitle="meal records"
        />
        <StatCard
          title="Favorite Recipe"
          value={analytics.favoriteRecipes[0]?.recipe.name || 'None'}
          subtitle={analytics.favoriteRecipes[0] ? `${analytics.favoriteRecipes[0].count} times` : ''}
        />
        <StatCard
          title="Most Common Meal Type"
          value={
            Object.entries(analytics.mealsByType)
              .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
          }
          subtitle={
            Object.entries(analytics.mealsByType)
              .sort(([,a], [,b]) => b - a)[0]?.[1].toString() + ' meals' || ''
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Most Frequently Made Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.favoriteRecipes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recipe data</p>
            ) : (
              <div className="space-y-3">
                {analytics.favoriteRecipes.slice(0, 5).map((item, index) => (
                  <div key={item.recipe.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.recipe.name}</p>
                        <p className="text-sm text-muted-foreground">{item.recipe.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.count}</p>
                      <p className="text-xs text-muted-foreground">times</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meal Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.mealsByType).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No meal data</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(analytics.mealsByType)
                  .sort(([,a], [,b]) => b - a)
                  .map(([mealType, count]) => (
                    <div key={mealType} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{mealType}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Used Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topIngredients.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No ingredient data</p>
            ) : (
              <div className="space-y-3">
                {analytics.topIngredients.slice(0, 8).map((item, index) => (
                  <div key={item.ingredient} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{item.ingredient}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {item.frequency.toFixed(1)}x
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
    <Card className="text-center">
      <CardContent className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
        <p className="text-2xl font-semibold mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  )
}
