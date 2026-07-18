import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, BookOpen, ScrollText,
  UserCog, FileText, Bell, BarChart3, Settings,
} from 'lucide-react';

const ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/users', icon: Users, label: 'Utilisateurs' },
  { to: '/admin/subscriptions', icon: CreditCard, label: 'Abonnements' },
  { to: '/admin/knowledge', icon: BookOpen, label: 'Base de savoir' },
  { to: '/admin/ai-logs', icon: ScrollText, label: 'Logs IA' },
  { to: '/admin/accountants', icon: UserCog, label: 'Comptables' },
  { to: '/admin/content', icon: FileText, label: 'Contenu' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Système' },
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
    </aside>
  );
}
