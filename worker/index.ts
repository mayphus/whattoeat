import { Database } from './db'
import { createClerkClient } from '@clerk/backend'

type WorkerEnv = Env & { 
  CLERK_SECRET_KEY: string
  VITE_CLERK_PUBLISHABLE_KEY: string 
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const db = new Database(env.DB)

    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Helper: Extract Bearer token
    const getAuthHeaderToken = () => {
      const auth = request.headers.get('Authorization') || ''
      // Handle both "Bearer token" and "Bearer Bearer token" cases
      const [, bearer] = auth.match(/^Bearer\s+(?:Bearer\s+)?(.+)$/i) || []
      return bearer || null
    }

    const getSessionCookieToken = () => {
      const cookie = request.headers.get('Cookie') || ''
      const match = cookie.split(';').map(p => p.trim()).find(p => p.startsWith('__session='))
      if (!match) return null
      const value = match.split('=')[1]
      try {
        return decodeURIComponent(value)
      } catch {
        return value
      }
    }

    // Helper: Verify token with Clerk Backend SDK
    const verifyClerkToken = async (): Promise<{ userId: string } | null> => {
      const clerkClient = createClerkClient({ 
        secretKey: env.CLERK_SECRET_KEY,
        publishableKey: env.VITE_CLERK_PUBLISHABLE_KEY 
      })
      
      try {
        const result = await clerkClient.authenticateRequest(request)
        
        if (result.isAuthenticated) {
          const authData = result.toAuth()
          return authData.userId ? { userId: authData.userId } : null
        }
        
        return null
      } catch (error) {
        console.warn('Clerk authentication failed:', error)
        return null
      }
    }

    // Guard: Require auth, return user or Response
    const requireUser = async (): Promise<{ userId: string } | Response> => {
      const verified = await verifyClerkToken()
      if (!verified) {
        return Response.json({ success: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
      }
      return verified
    }

    try {
      // Recipe endpoints
      if (url.pathname === '/api/recipes' && request.method === 'GET') {
        const user = await requireUser()
        if (user instanceof Response) return user
        const recipes = await db.getRecipes(user.userId)
        return Response.json({ success: true, data: recipes }, { headers: corsHeaders })
      }

      if (url.pathname === '/api/recipes' && request.method === 'POST') {
        const user = await requireUser()
        if (user instanceof Response) return user
        const recipe = await request.json()
        const createdRecipe = await db.createRecipe(recipe as any, user.userId)
        return Response.json({ success: true, data: createdRecipe }, { headers: corsHeaders })
      }

      if (url.pathname.startsWith('/api/recipes/') && request.method === 'GET') {
        const user = await requireUser()
        if (user instanceof Response) return user
        const id = url.pathname.split('/')[3]
        const recipe = await db.getRecipeById(id, user.userId)
        if (!recipe) {
          return Response.json({ success: false, error: 'Recipe not found' }, { status: 404, headers: corsHeaders })
        }
        return Response.json({ success: true, data: recipe }, { headers: corsHeaders })
      }

      if (url.pathname.startsWith('/api/recipes/') && request.method === 'PUT') {
        const user = await requireUser()
        if (user instanceof Response) return user
        const id = url.pathname.split('/')[3]
        const updates = await request.json()
        const updatedRecipe = await db.updateRecipe(id, updates as any, user.userId)
        if (!updatedRecipe) {
          return Response.json({ success: false, error: 'Recipe not found' }, { status: 404, headers: corsHeaders })
        }
        return Response.json({ success: true, data: updatedRecipe }, { headers: corsHeaders })
      }

      // Meal endpoints
      if (url.pathname === '/api/meals' && request.method === 'GET') {
        const user = await requireUser()
        if (user instanceof Response) return user
        const startDate = url.searchParams.get('startDate') || undefined
        const endDate = url.searchParams.get('endDate') || undefined
        const meals = await db.getMeals(user.userId, startDate, endDate)
        return Response.json({ success: true, data: meals }, { headers: corsHeaders })
      }

      if (url.pathname === '/api/meals' && request.method === 'POST') {
        const user = await requireUser()
        if (user instanceof Response) return user
        const meal = await request.json()
        const createdMeal = await db.createMeal(meal as any, user.userId)
        return Response.json({ success: true, data: createdMeal }, { headers: corsHeaders })
      }

      if (url.pathname.startsWith('/api/meals/') && request.method === 'GET') {
        const user = await requireUser()
        if (user instanceof Response) return user
        const id = url.pathname.split('/')[3]
        const meal = await db.getMealById(id, user.userId)
        if (!meal) {
          return Response.json({ success: false, error: 'Meal not found' }, { status: 404, headers: corsHeaders })
        }
        return Response.json({ success: true, data: meal }, { headers: corsHeaders })
      }

      // Analytics endpoint
      if (url.pathname === '/api/analytics' && request.method === 'GET') {
        const user = await requireUser()
        if (user instanceof Response) return user
        const startDate = url.searchParams.get('startDate') || undefined
        const endDate = url.searchParams.get('endDate') || undefined
        const analytics = await db.getAnalytics(user.userId, startDate, endDate)
        return Response.json({ success: true, data: analytics }, { headers: corsHeaders })
      }

      // Image upload endpoint
      if (url.pathname === '/api/upload' && request.method === 'POST') {
        const user = await requireUser()
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
