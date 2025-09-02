# WhatToEat - Technical Documentation

## Architecture Overview

WhatToEat is a modern full-stack web application for meal planning and recipe management, built using:

### Frontend Stack
- **React 19** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **Clerk** for authentication
- **React Hook Form** with Zod validation

### Backend Stack
- **Cloudflare Workers** for serverless API
- **Cloudflare D1** (SQLite) for database
- **Cloudflare R2** for image storage

## Database Schema

### Tables

#### `recipes`
- `id` (TEXT, PRIMARY KEY) - UUID
- `user_id` (TEXT) - Clerk user ID for data scoping
- `name` (TEXT, NOT NULL) - Recipe name
- `description` (TEXT) - Optional recipe description
- `image_url` (TEXT) - Optional image URL
- `is_public` (INTEGER, DEFAULT 0) - Public sharing flag
- `created_at` (TEXT, NOT NULL) - ISO timestamp

#### `meals`
- `id` (TEXT, PRIMARY KEY) - UUID
- `user_id` (TEXT) - Clerk user ID for data scoping
- `date` (TEXT, NOT NULL) - Date in YYYY-MM-DD format
- `meal_type` (TEXT, NOT NULL) - "breakfast", "lunch", "dinner", or "snack"
- `recipe_id` (TEXT) - Foreign key to recipes table (nullable)
- `custom_food_name` (TEXT) - Alternative to recipe (nullable)
- `portion` (REAL, DEFAULT 1.0) - Portion size multiplier
- `notes` (TEXT) - Optional notes
- `created_at` (TEXT, NOT NULL) - ISO timestamp

### Indexes
- `idx_recipes_user_id` - Fast user recipe queries
- `idx_recipes_is_public` - Fast public recipe queries
- `idx_meals_user_id` - Fast user meal queries
- `idx_meals_date` - Fast date-based meal queries
- `idx_meals_recipe_id` - Fast recipe-based meal queries

## API Endpoints

### Authentication
All authenticated endpoints require either:
- `Authorization: Bearer <token>` header
- `__session` cookie (Clerk session)

### Recipe Endpoints

#### `GET /api/recipes`
Get user's recipes
- **Auth**: Required
- **Response**: `Recipe[]`

#### `POST /api/recipes`
Create new recipe
- **Auth**: Required
- **Body**: `CreateRecipeRequest`
- **Response**: `Recipe`

#### `GET /api/recipes/:id`
Get specific user recipe
- **Auth**: Required
- **Response**: `Recipe`

#### `PUT /api/recipes/:id`
Update recipe
- **Auth**: Required
- **Body**: `Partial<Recipe>`
- **Response**: `Recipe`

### Public Recipe Endpoints

#### `GET /api/public/recipes`
Get all public recipes
- **Auth**: Not required
- **Response**: `Recipe[]`

#### `GET /api/public/recipes/:id`
Get specific public recipe
- **Auth**: Not required
- **Response**: `Recipe`

#### `POST /api/public/recipes/:id/import`
Import public recipe to user's collection
- **Auth**: Required
- **Response**: `Recipe`

### Meal Endpoints

#### `GET /api/meals`
Get user's meals
- **Auth**: Required
- **Query**: `startDate`, `endDate` (optional)
- **Response**: `Meal[]`

#### `POST /api/meals`
Create new meal
- **Auth**: Required
- **Body**: `CreateMealRequest`
- **Response**: `Meal`

#### `GET /api/meals/:id`
Get specific meal
- **Auth**: Required
- **Response**: `Meal`

#### `PUT /api/meals/:id`
Update meal
- **Auth**: Required
- **Body**: `Partial<Meal>`
- **Response**: `Meal`

### Analytics Endpoint

#### `GET /api/analytics`
Get meal analytics
- **Auth**: Required
- **Query**: `startDate`, `endDate` (optional)
- **Response**: `MealAnalytics`

### Image Endpoints

#### `POST /api/upload`
Upload recipe image
- **Auth**: Required
- **Body**: `FormData` with `image` field
- **Response**: `{ imageUrl: string }`

#### `GET /api/images/:filename`
Serve uploaded images
- **Auth**: Not required
- **Response**: Image file

## Type Definitions

### Core Types

```typescript
interface Recipe {
  id: string
  name: string
  description?: string
  imageUrl?: string
  isPublic: boolean
  createdAt: string
}

interface CreateRecipeRequest {
  name: string
  description?: string
  imageUrl?: string
  isPublic?: boolean
}

interface Meal {
  id: string
  date: string
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  recipeId?: string
  recipe?: Recipe
  customFoodName?: string
  portion: number
  notes?: string
  createdAt: string
}

interface CreateMealRequest {
  date: string
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  recipeId?: string
  customFoodName?: string
  portion: number
  notes?: string
}

interface MealAnalytics {
  totalMeals: number
  favoriteRecipes: Array<{ recipe: Recipe; count: number }>
  mealsByType: Record<string, number>
  topIngredients: Array<{ ingredient: string; frequency: number }>
}
```

## Security Features

### Authentication
- Uses Clerk for secure authentication
- JWT token verification on all protected endpoints
- User data scoping via `user_id` columns

### Data Validation
- Input validation using Zod schemas
- SQL injection protection via prepared statements
- File upload validation (type, size limits)

### CORS
- Configurable CORS headers
- Credential support for authenticated requests

## Development Setup

### Prerequisites
- Node.js 18+
- Wrangler CLI
- Cloudflare account

### Environment Variables
```bash
# .dev.vars (for local development)
CLERK_SECRET_KEY=your_clerk_secret_key
```

### Commands
```bash
# Development
npm run dev          # Start Vite dev server
npm run dev:sync     # Sync production data

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run test:run     # Run tests once

# Linting
npm run lint         # Run ESLint

# Deployment
npm run deploy       # Deploy to Cloudflare
npm run cf-typegen   # Generate Cloudflare types
```

## Database Migrations

Migration files are located in `/migrations/`:

1. `0001_create_recipes_table.sql` - Initial recipe table
2. `0002_add_user_scoping.sql` - Add user scoping
3. `0003_simplify_database.sql` - Remove unused tables/columns
4. `0004_add_is_public_to_recipes.sql` - Add public sharing

## Performance Optimizations

### Database
- Proper indexing on frequently queried columns
- User-scoped queries to minimize data transfer
- Prepared statements for query optimization

### Frontend
- React 19 for better performance
- Code splitting with Vite
- Image optimization and caching
- Efficient state management with hooks

### Backend
- Serverless architecture with Cloudflare Workers
- CDN-based image serving with R2
- Connection pooling handled by Cloudflare D1

## Deployment Architecture

### Production Environment
- **Frontend**: Static files served via Cloudflare Pages
- **Backend**: Cloudflare Workers for API
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 for images
- **CDN**: Cloudflare global network

### CI/CD
- GitHub Actions for automated deployment
- Environment variable management via Cloudflare dashboard
- Automated testing before deployment

## Monitoring and Logging

### Error Handling
- Comprehensive error boundaries in React
- Structured error responses from API
- Client-side error logging

### Performance Monitoring
- Cloudflare Analytics for request metrics
- Vite build analyzer for bundle optimization
- React DevTools for component performance

## Future Enhancements

### Planned Features
- Meal planning calendar
- Nutritional information integration
- Recipe sharing and rating system
- Mobile app development
- Grocery list generation

### Technical Improvements
- Implement caching strategies
- Add real-time synchronization
- Enhance image processing
- Add comprehensive testing suite
- Implement rate limiting