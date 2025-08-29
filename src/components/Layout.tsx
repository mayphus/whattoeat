import { NavLink, Outlet } from 'react-router-dom'
import { UserButton, useUser } from '@clerk/clerk-react'

export default function Layout() {
  const { user } = useUser()

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container max-w-2xl mx-auto flex h-16 items-center px-4">
          <NavLink to="/" className="text-xl font-semibold" end>
            吃啥?
          </NavLink>
          
          <div className="ml-auto flex items-center space-x-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-foreground/80 ${isActive ? 'text-foreground' : 'text-foreground/60'}`
              }
              end
            >
              食譜
            </NavLink>
            <NavLink 
              to="/meals" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-foreground/80 ${isActive ? 'text-foreground' : 'text-foreground/60'}`
              }
            >
              用餐
            </NavLink>
            <NavLink 
              to="/analytics" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-foreground/80 ${isActive ? 'text-foreground' : 'text-foreground/60'}`
              }
            >
              統計
            </NavLink>
            
            {/* User menu */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                歡迎, {user?.firstName || user?.username}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container max-w-2xl mx-auto py-8 px-4">
        <Outlet />
      </main>
    </div>
  )
}