import { NavLink, Outlet } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'

export default function Layout() {

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container max-w-2xl mx-auto flex h-16 items-center px-4">
          <NavLink to="/" className="text-xl font-semibold" end>
            What to Eat?
          </NavLink>
          
          <div className="ml-auto flex items-center space-x-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-foreground/80 ${isActive ? 'text-foreground' : 'text-foreground/60'}`
              }
              end
            >
              Recipes
            </NavLink>
            <NavLink 
              to="/meals" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-foreground/80 ${isActive ? 'text-foreground' : 'text-foreground/60'}`
              }
            >
              Meals
            </NavLink>
            <NavLink 
              to="/analytics" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-foreground/80 ${isActive ? 'text-foreground' : 'text-foreground/60'}`
              }
            >
              Analytics
            </NavLink>
            
            {/* User menu */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>
      
      <main className="container max-w-2xl mx-auto py-8 px-4">
        <Outlet />
      </main>
    </div>
  )
}