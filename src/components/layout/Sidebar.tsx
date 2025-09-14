import { NavLink } from 'react-router-dom'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentUser } from '@/store/slices/authSlice'

const NavItem = ({ to, label }: { to: string; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `block rounded-md px-3 py-2 text-sm font-medium hover:bg-white/60 ${
        isActive ? 'bg-white text-black' : 'text-slate-800'
      }`
    }
  >
    {label}
  </NavLink>
)

const Sidebar = () => {
  const user = useAppSelector(selectCurrentUser)
  const role = user?.agent_id ? 'agent' : 'admin'

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-white p-4 md:block">
      <div className="mb-6 text-lg font-semibold">360Ghar Portal</div>
      <nav className="space-y-1">
        <NavItem to="/dashboard" label="Dashboard" />
        <NavItem to="/properties" label={role === 'agent' ? 'My Properties' : 'All Properties'} />
        <NavItem to="/users" label={role === 'agent' ? 'My Users' : 'All Users'} />
        <NavItem to="/visits" label={role === 'agent' ? 'My Visits' : 'All Visits'} />
        <NavItem to="/bookings" label={role === 'agent' ? 'My Bookings' : 'All Bookings'} />
        {role === 'admin' && (
          <>
            <NavItem to="/agents" label="Agents" />
            <NavItem to="/analytics" label="Analytics" />
          </>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar

