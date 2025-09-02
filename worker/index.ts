import { Database } from './db'
import { verifyToken } from '@clerk/backend'
import type { CreateRecipeRequest, CreateMealRequest, Recipe, Meal } from '../src/types'

interface WorkerEnv {
  DB: D1Database
  IMAGES: R2Bucket
  CLERK_SECRET_KEY: string
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const db = new Database(env.DB)

    // Enable CORS (allow credentials + echo Origin)
    const origin = request.headers.get('Origin') || ''
    const allowOrigin = origin || '*'
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Vary': 'Origin',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Simple auth check
    const getUser = async (): Promise<{ userId: string } | null> => {
      // Prefer Authorization header token
      let token: string | null = null
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }

      // Fallback to Clerk session cookie (e.g., __session)
      if (!token) {
        const cookieHeader = request.headers.get('Cookie') || ''
        const cookies = Object.fromEntries(
          cookieHeader
            .split(';')
            .map((c) => c.trim())
            .filter(Boolean)
            .map((c) => {
              const idx = c.indexOf('=')
              if (idx === -1) return [c, ''] as const
              const k = decodeURIComponent(c.slice(0, idx))
              const v = decodeURIComponent(c.slice(idx + 1))
              return [k, v] as const
            })
        ) as Record<string, string>
        token = cookies['__session'] || null
      }

      if (!token) return null
      
      try {
        const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY })
        return payload?.sub ? { userId: payload.sub } : null
      } catch (error) {
        console.error('Auth failed:', error)
        return null
      }
    }

    const requireAuth = async () => {
      const user = await getUser()
      if (!user) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
      }
      return user
    }

    try {
      // Recipe endpoints
      if (url.pathname === '/api/recipes' && request.method === 'GET') {
        const user = await requireAuth()
        if (user instanceof Response) return user
        const recipes = await db.getRecipes(user.userId)
        return Response.json({ success: true, data: recipes }, { headers: corsHeaders })
      }

      if (url.pathname === '/api/recipes' && request.method === 'POST') {
        const user = await requireAuth()
        if (user instanceof Response) return user
        const recipe = await request.json()
        const createdRecipe = await db.createRecipe(recipe as CreateRecipeRequest, user.userId)
        return Response.json({ success: true, data: createdRecipe }, { headers: corsHeaders })
      }

      if (url.pathname.startsWith('/api/recipes/') && request.method === 'GET') {
        const user = await requireAuth()
        if (user instanceof Response) return user
        const id = url.pathname.split('/')[3]
        const recipe = await db.getRecipeById(id, user.userId)
        if (!recipe) {
          return Response.json({ success: false, error: 'Recipe not found' }, { status: 404, headers: corsHeaders })
        }
        return Response.json({ success: true, data: recipe }, { headers: corsHeaders })
      }

      if (url.pathname.startsWith('/api/recipes/') && request.method === 'PUT') {
        const user = await requireAuth()
        if (user instanceof Response) return user
        const id = url.pathname.split('/')[3]
        const updates = await request.json()
        const updatedRecipe = await db.updateRecipe(id, updates as Partial<Recipe>, user.userId)
        if (!updatedRecipe) {
          return Response.json({ success: false, error: 'Recipe not found' }, { status: 404, headers: corsHeaders })
        }
        return Response.json({ success: true, data: updatedRecipe }, { headers: corsHeaders })
      }

      // Public recipe endpoints (no auth required for viewing)
      if (url.pathname === '/api/public/recipes' && request.method === 'GET') {
        const recipes = await db.getPublicRecipes()
        return Response.json({ success: true, data: recipes }, { headers: corsHeaders })
      }

      if (url.pathname.startsWith('/api/public/recipes/') && request.method === 'GET') {
        const id = url.pathname.split('/')[4]
        const recipe = await db.getPublicRecipeById(id)
        if (!recipe) {
          return Response.json({ success: false, error: 'Recipe not found' }, { status: 404, headers: corsHeaders })
        }
        return Response.json({ success: true, data: recipe }, { headers: corsHeaders })
      }

      if (url.pathname.startsWith('/api/public/recipes/') && url.pathname.endsWith('/import') && request.method === 'POST') {
        const user = await requireAuth()
        if (user instanceof Response) return user
        const parts = url.pathname.split('/')
        // /api/public/recipes/:id/import -> index: [ '', 'api', 'public', 'recipes', ':id', 'import' ]
        const id = parts[4]
        const imported = await db.importPublicRecipe(id, user.userId)
        if (!imported) {
          return Response.json({ success: false, error: 'Recipe not found or not public' }, { status: 404, headers: corsHeaders })
        }
        return Response.json({ success: true, data: imported }, { headers: corsHeaders })
      }

      // Meal endpoints
      if (url.pathname === '/api/meals' && request.method === 'GET') {
        const user = await requireAuth()
        if (user instanceof Response) return user
        const startDate = url.searchParams.get('startDate') || undefined
        const endDate = url.searchParams.get('endDate') || undefined
        const meals = await db.getMeals(user.userId, startDate, endDate)
        return Response.json({ success: true, data: meals }, { headers: corsHeaders })
      }

      if (url.pathname === '/api/meals' && request.method === 'POST') {
        const user = await requireAuth()
        if (user instanceof Response) return user
        const meal = await request.json()
        const createdMeal = await db.createMeal(meal as CreateMealRequest, user.userId)
        return Response.json({ success: true, data: createdMeal }, { headers: corsHeaders })
      }

      if (url.pathname.startsWith('/api/meals/') && request.method === 'GET') {
        const user = await requireAuth()
        if (user instanceof Response) return user
        const id = url.pathname.split('/')[3]
        const meal = await db.getMealById(id, user.userId)
        if (!meal) {
          return Response.json({ success: false, error: 'Meal not found' }, { status: 404, headers: corsHeaders })
        }
        return Response.json({ success: true, data: meal }, { headers: corsHeaders })
      }

      if (url.pathname.startsWith('/api/meals/') && request.method === 'PUT') {
        const user = await requireAuth()
        if (user instanceof Response) return user
        const id = url.pathname.split('/')[3]
        const updates = await request.json()
        const updatedMeal = await db.updateMeal(id, updates as Partial<Meal>, user.userId)
        if (!updatedMeal) {
          return Response.json({ success: false, error: 'Meal not found' }, { status: 404, headers: corsHeaders })
        }
        return Response.json({ success: true, data: updatedMeal }, { headers: corsHeaders })
      }

      // Analytics endpoint
      if (url.pathname === '/api/analytics' && request.method === 'GET') {
        const user = await requireAuth()
        if (user instanceof Response) return user
        const startDate = url.searchParams.get('startDate') || undefined
        const endDate = url.searchParams.get('endDate') || undefined
        const analytics = await db.getAnalytics(user.userId, startDate, endDate)
        return Response.json({ success: true, data: analytics }, { headers: corsHeaders })
      }

      // Image upload endpoint
      if (url.pathname === '/api/upload' && request.method === 'POST') {
        const user = await requireAuth()
        if (user instanceof Response) return user
        const formData = await request.formData()
        const file = formData.get('image') as File
        
        if (!file) {
          return Response.json({ success: false, error: 'No image file provided' }, { status: 400, headers: corsHeaders })
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          return Response.json({ success: false, error: 'Invalid file type' }, { status: 400, headers: corsHeaders })
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          return Response.json({ success: false, error: 'File too large' }, { status: 400, headers: corsHeaders })
        }

        try {
          // Generate unique filename
          const timestamp = Date.now()
          const extension = file.name.split('.').pop() || 'jpg'
          const fileName = `recipe-${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
          
          // Upload to R2
          await env.IMAGES.put(fileName, file.stream(), {
            httpMetadata: {
              contentType: file.type,
            },
          })

          const imageUrl = `/api/images/${fileName}`
          return Response.json({ success: true, data: { imageUrl } }, { headers: corsHeaders })
        } catch (error) {
          console.error('Image upload error:', error)
          return Response.json({ success: false, error: 'Upload failed' }, { status: 500, headers: corsHeaders })
        }
      }

      // Serve images
      if (url.pathname.startsWith('/api/images/') && request.method === 'GET') {
        const fileName = url.pathname.split('/api/images/')[1]
        if (!fileName) {
          return new Response('Image not found', { status: 404, headers: corsHeaders })
        }

        try {
          const object = await env.IMAGES.get(fileName)
          if (!object) {
            return new Response('Image not found', { status: 404, headers: corsHeaders })
          }

          const headers = {
            ...corsHeaders,
            'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
            'Cache-Control': 'public, max-age=31536000', // 1 year cache
          }

          return new Response(object.body, { headers })
        } catch (error) {
          console.error('Image serve error:', error)
          return new Response('Image not found', { status: 404, headers: corsHeaders })
        }
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
} satisfies ExportedHandler<WorkerEnv>;
