#!/usr/bin/env node

// Simple script to copy production data to local development database

async function syncData() {
  console.log('Syncing production data to local development...')
  
  try {
    // Fetch recipes from production
    const response = await fetch('https://whattoeat.mayphus.workers.dev/api/recipes')
    const data = await response.json()
    
    if (!data.success) {
      throw new Error('Failed to fetch production recipes')
    }
    
    console.log(`Found ${data.data.length} recipes in production`)
    
    // Add each recipe to local development
    for (const recipe of data.data) {
      const localResponse = await fetch('http://localhost:5173/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: recipe.name,
          description: recipe.description,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          difficulty: recipe.difficulty,
          category: recipe.category,
          instructions: recipe.instructions,
          ingredients: recipe.ingredients.map(ing => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit
          })),
          nutrition: recipe.nutrition
        })
      })
      
      if (localResponse.ok) {
        console.log(`✓ Synced recipe: ${recipe.name}`)
      } else {
        console.log(`✗ Failed to sync recipe: ${recipe.name}`)
      }
    }
    
    console.log('✓ Data sync completed')
    
  } catch (error) {
    console.error('Sync failed:', error.message)
    process.exit(1)
  }
}

syncData()