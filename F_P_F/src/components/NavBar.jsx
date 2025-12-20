import { NavLink } from 'react-router-dom'

const navItemClass =
  'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/80 hover:text-gray-900'

const activeClass = 'bg-white text-gray-900 shadow-sm'

export default function NavBar() {
  return (
    <header className="border-b border-slate-200 bg-slate-50/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="text-lg font-semibold text-slate-900">Cake Shop Admin</div>
        <nav className="flex items-center gap-2 text-slate-700">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : 'text-slate-700'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : 'text-slate-700'}`
            }
          >
            Users
          </NavLink>
          <NavLink
            to="/public"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : 'text-slate-700'}`
            }
          >
            Public Page
          </NavLink>
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `${navItemClass} ${isActive ? activeClass : 'text-slate-700'}`
            }
          >
            My Account
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

