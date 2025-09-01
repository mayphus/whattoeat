import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import { Menu, X } from 'lucide-react'

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <NavLink to="/" className="text-xl font-semibold" end>
              What to Eat?
            </NavLink>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-6">
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
              <UserButton afterSignOutUrl="/" />
            </div>

            {/* Mobile menu button and user button */}
            <div className="md:hidden flex items-center space-x-2">
              <UserButton afterSignOutUrl="/" />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-foreground/60 hover:text-foreground hover:bg-accent"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile navigation menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-2">
                <NavLink 
                  to="/" 
                  className={({ isActive }) => 
                    `px-3 py-2 text-sm font-medium transition-colors hover:text-foreground/80 hover:bg-accent rounded-md ${isActive ? 'text-foreground bg-accent' : 'text-foreground/60'}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                  end
                >
                  Recipes
                </NavLink>
                <NavLink 
                  to="/meals" 
                  className={({ isActive }) => 
                    `px-3 py-2 text-sm font-medium transition-colors hover:text-foreground/80 hover:bg-accent rounded-md ${isActive ? 'text-foreground bg-accent' : 'text-foreground/60'}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meals
                </NavLink>
                <NavLink 
                  to="/analytics" 
                  className={({ isActive }) => 
                    `px-3 py-2 text-sm font-medium transition-colors hover:text-foreground/80 hover:bg-accent rounded-md ${isActive ? 'text-foreground bg-accent' : 'text-foreground/60'}`
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  Analytics
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <main className="container max-w-2xl mx-auto py-8 px-4">
        <Outlet />
      </main>
    </div>
  )
}