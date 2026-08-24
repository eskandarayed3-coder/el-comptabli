import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, KeyRound } from 'lucide-react';
import { AdminLogoutButton } from './AdminAuthGate.jsx';

const ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { to: '/admin/codes', icon: KeyRound, label: 'Codes d’activation' },
];

export default function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="brand row" style={{ gap: 10, alignItems: 'center' }}>
        <img src="/icon.svg" width="28" height="28" alt="" style={{ borderRadius: 7 }} /> El Comptabli
      </div>
      {ITEMS.map(({ to, icon: Icon, label, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
      <AdminLogoutButton />
    </aside>
  );
}
