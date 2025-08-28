import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div>
      <nav className="nav">
        <div className="container">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="nav-brand" end>
              What to Eat
            </NavLink>
            
            <div className="nav-links">
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
      
      <main className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
        <Outlet />
      </main>
    </div>
  )
}