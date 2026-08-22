import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, ScanLine, Wallet, BookOpen, User } from 'lucide-react';
import { useT } from '../i18n/index.js';
import { useAuth } from '../lib/auth.jsx';

export default function BottomNav() {
  const { t } = useT();
  const { guest } = useAuth();
  const items = [
    { to: '/home', icon: Home, label: t('nav.home') },
    ...(!guest ? [
      { to: '/chat', icon: MessageCircle, label: t('nav.ai') },
      { to: '/scanner', icon: ScanLine, label: t('nav.scanner') },
    ] : []),
    { to: '/finance', icon: Wallet, label: t('nav.finance') },
    { to: '/knowledge', icon: BookOpen, label: t('nav.learn') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];
  return (
    <nav className="bottom-nav">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
          <Icon size={20} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
