import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div>
      <nav className="nav">
        <div className="container">
          <div className="flex items-center justify-between">
            <NavLink to="/" className="nav-brand" end>
              吃啥?
            </NavLink>
            
            <div className="nav-links">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
                end
              >
                食譜
              </NavLink>
              <NavLink 
                to="/meals" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                用餐
              </NavLink>
              <NavLink 
                to="/analytics" 
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                統計
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