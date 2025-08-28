import { Database } from './db'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const db = new Database(env.DB)

    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // Recipe endpoints
      if (url.pathname === '/api/recipes' && request.method === 'GET') {
        const recipes = await db.getRecipes()
        return Response.json({ success: true, data: recipes }, { headers: corsHeaders })
      }

      if (url.pathname === '/api/recipes' && request.method === 'POST') {
        const recipe = await request.json()
        const createdRecipe = await db.createRecipe(recipe)
        return Response.json({ success: true, data: createdRecipe }, { headers: corsHeaders })
      }

      if (url.pathname.startsWith('/api/recipes/') && request.method === 'GET') {
        const id = url.pathname.split('/')[3]
        const recipe = await db.getRecipeById(id)
        if (!recipe) {
          return Response.json({ success: false, error: 'Recipe not found' }, { status: 404, headers: corsHeaders })
        }
        return Response.json({ success: true, data: recipe }, { headers: corsHeaders })
      }

      // Meal endpoints
      if (url.pathname === '/api/meals' && request.method === 'GET') {
        const startDate = url.searchParams.get('startDate') || undefined
        const endDate = url.searchParams.get('endDate') || undefined
        const meals = await db.getMeals(startDate, endDate)
        return Response.json({ success: true, data: meals }, { headers: corsHeaders })
      }

      if (url.pathname === '/api/meals' && request.method === 'POST') {
        const meal = await request.json()
        const createdMeal = await db.createMeal(meal)
        return Response.json({ success: true, data: createdMeal }, { headers: corsHeaders })
      }

      if (url.pathname.startsWith('/api/meals/') && request.method === 'GET') {
        const id = url.pathname.split('/')[3]
        const meal = await db.getMealById(id)
        if (!meal) {
          return Response.json({ success: false, error: 'Meal not found' }, { status: 404, headers: corsHeaders })
        }
        return Response.json({ success: true, data: meal }, { headers: corsHeaders })
      }

      // Analytics endpoint
      if (url.pathname === '/api/analytics' && request.method === 'GET') {
        const startDate = url.searchParams.get('startDate') || undefined
        const endDate = url.searchParams.get('endDate') || undefined
        const analytics = await db.getAnalytics(startDate, endDate)
        return Response.json({ success: true, data: analytics }, { headers: corsHeaders })
      }

      return new Response(null, { status: 404, headers: corsHeaders })
    } catch (error) {
      console.error('API Error:', error)
      return Response.json(
        { success: false, error: 'Internal server error' },
        { status: 500, headers: corsHeaders }
      )
    }
  },
} satisfies ExportedHandler<Env>;
