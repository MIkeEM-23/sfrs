import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, CalendarCheck, CalendarDays, User, LogOut, Menu, X, ShieldCheck, School } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/facilities', label: 'Facilities', icon: Building2 },
    { to: '/my-reservations', label: 'My Reservations', icon: CalendarCheck },
    { to: '/availability', label: 'Availability', icon: CalendarDays },
    { to: '/profile', label: 'Profile', icon: User },
  ];
  if (user.role === 'admin') links.push({ to: '/admin', label: 'Admin Dashboard', icon: ShieldCheck });

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-blue-950 text-white px-4 py-3">
        <span className="font-semibold flex items-center gap-2"><School size={20} /> Facility Reservation</span>
        <button onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
      </div>

      {/* Sidebar */}
      <aside className={`${open ? 'block' : 'hidden'} md:block md:w-64 md:min-h-screen bg-blue-950 text-white p-4 md:sticky md:top-0 md:h-screen`}>
        <div className="hidden md:flex items-center gap-2 text-lg font-bold mb-8 mt-2 px-2"><School /> Facility Reservation</div>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-blue-700' : 'hover:bg-blue-900'}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-blue-900">
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto"><Outlet /></main>
    </div>
  );
}
