import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, ScanLine, Wallet, BookOpen, User } from 'lucide-react';
import { useT } from '../i18n/index.js';
import { useAuth } from '../lib/auth.jsx';

export default function BottomNav() {
  const { t } = useT();
  const { guest } = useAuth();
  const leftItems = [
    { to: '/home', icon: Home, label: t('nav.home') },
    { to: '/chat', icon: MessageCircle, label: t('nav.ai') },
  ];
  const rightItems = [
    { to: '/finance', icon: Wallet, label: t('nav.finance') },
    { to: '/knowledge', icon: BookOpen, label: t('nav.learn') },
    { to: '/profile', icon: User, label: t('nav.profile') },
  ];

  const NavItem = ({ to, icon: Icon, label, className = '' }) => (
    <NavLink key={to} to={to} className={({ isActive }) => `${isActive ? 'active ' : ''}${className}`.trim()}>
      <Icon size={className ? 24 : 20} strokeWidth={2} />
      <span>{label}</span>
    </NavLink>
  );

  // Guests can explore the local app, but the costly upload/AI scanner stays
  // behind authenticated server endpoints. Use an ordinary four-item bar.
  if (guest) {
    return (
      <nav className="bottom-nav">
        {[leftItems[0], ...rightItems].map((item) => <NavItem key={item.to} {...item} />)}
      </nav>
    );
  }

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-group bottom-nav-group-start">
        {leftItems.map((item) => <NavItem key={item.to} {...item} />)}
      </div>
      <NavItem to="/scanner" icon={ScanLine} label={t('nav.scanner')} className="scan-center" />
      <div className="bottom-nav-group bottom-nav-group-end">
        {rightItems.map((item) => <NavItem key={item.to} {...item} />)}
      </div>
    </nav>
  );
}
