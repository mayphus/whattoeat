import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import Layout from './components/Layout'
import RecipesPage from './pages/RecipesPage'
import NewRecipePage from './pages/NewRecipePage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import MealsPage from './pages/MealsPage'
import NewMealPage from './pages/NewMealPage'
import AnalyticsPage from './pages/AnalyticsPage'
import WelcomePage from './pages/WelcomePage'
import AuthSignInPage from './pages/AuthSignInPage'
import AuthSignUpPage from './pages/AuthSignUpPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in/*" element={<AuthSignInPage />} />
        <Route path="/sign-up/*" element={<AuthSignUpPage />} />
        <Route path="/" element={
          <>
            <SignedIn>
              <Layout />
            </SignedIn>
            <SignedOut>
              <WelcomePage />
            </SignedOut>
          </>
        }>
          <Route index element={<RecipesPage />} />
          <Route path="recipes/new" element={<NewRecipePage />} />
          <Route path="recipes/:id" element={<RecipeDetailPage />} />
          <Route path="meals" element={<MealsPage />} />
          <Route path="meals/new" element={<NewMealPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
