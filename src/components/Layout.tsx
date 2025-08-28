import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div>
      <nav className="nav">
        <div className="container">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="text-xl font-semibold text-gray-900">
              What to Eat
            </NavLink>
            
            <div className="flex gap-6">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                end
              >
                Recipes
              </NavLink>
              <NavLink 
                to="/meals" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                Meals
              </NavLink>
              <NavLink 
                to="/analytics" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                Analytics
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  )
}