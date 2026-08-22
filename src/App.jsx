import { Suspense, useEffect, useReducer } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav.jsx';
import Toast from './components/Toast.jsx';
import LockScreen from './components/LockScreen.jsx';
import Sidebar from './components/admin/Sidebar.jsx';
import AdminAuthGate from './components/admin/AdminAuthGate.jsx';
import { AdminSecretProvider } from './lib/adminAuth.jsx';
import { useStore, isPremium } from './lib/store.jsx';
import { useAuth } from './lib/auth.jsx';
import { isPaywallAllowed } from './lib/paywall.js';
import { manifest, adminManifest } from './routes.js';
import ScreensIndex from './screens/ScreensIndex.jsx';

const NAV_PATHS = ['/home', '/chat', '/scanner', '/finance', '/knowledge', '/profile'];

function MobileShell({ onboarded }) {
  const location = useLocation();
  const { state } = useStore();
  const { user, ready, configured } = useAuth();
  const premiumUntil = state.settings.premiumUntil;
  const publicPath = ['/splash', '/welcome', '/language', '/user-type', '/business-info', '/tax-regime', '/ai-intro', '/subscription-select', '/permissions', '/setup-complete', '/login', '/register', '/forgot-password', '/otp', '/auth/callback', '/legal/terms', '/legal/privacy']
    .some((path) => location.pathname.startsWith(path));

  // The instant the pass runs out, wake the shell so the lock screen takes
  // over immediately — even if the user is mid-screen and never navigates.
  const [, wake] = useReducer((x) => x + 1, 0);
  useEffect(() => {
    if (!premiumUntil) return undefined;
    const ms = new Date(premiumUntil).getTime() - Date.now();
    if (ms <= 0) return undefined;
    const id = setTimeout(wake, ms + 250);
    return () => clearTimeout(id);
  }, [premiumUntil]);

  if (!configured) {
    return <div className="phone-frame"><div className="screen no-nav center" style={{ justifyContent: 'center', alignItems: 'center', gap: 12 }}><h2>Configuration requise</h2><p className="small muted">La connexion sécurisée n’est pas encore configurée.</p></div></div>;
  }
  if (!ready) {
    return <div className="phone-frame"><div className="screen no-nav center"><p className="small muted">Connexion…</p></div></div>;
  }
  if (!user && !publicPath) return <Navigate to="/login" replace />;

  // Once onboarding is done, using the app requires an active pass — except
  // for the screens that let you buy/activate one (see paywall.js).
  const locked = onboarded && !isPremium(state.settings) && !isPaywallAllowed(location.pathname);
  const showNav = !locked && NAV_PATHS.some((p) => location.pathname.startsWith(p));
  return (
    <div className="phone-frame">
      {locked ? (
        <LockScreen />
      ) : (
        <Suspense fallback={<div className="screen"><p className="muted">Chargement…</p></div>}>
          <Routes>
            {manifest.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            <Route path="/" element={<Navigate to={onboarded ? '/home' : '/splash'} replace />} />
            <Route path="*" element={<Navigate to={onboarded ? '/home' : '/splash'} replace />} />
          </Routes>
        </Suspense>
      )}
      {showNav && <BottomNav />}
      <Toast />
    </div>
  );
}

function AdminShell() {
  // Admin is an internal French-only ops tool (per the design spec) — always LTR,
  // independent of the mobile app's user-facing language setting. Real customer
  // data is gated by the authenticated ADMIN_EMAILS allow-list.
  return (
    <AdminSecretProvider>
      <AdminAuthGate>
        <div className="admin-frame" dir="ltr">
          <Sidebar />
          <div className="admin-main">
            <Suspense fallback={<p className="muted">Chargement…</p>}>
              <Routes>
                {adminManifest.map(({ path, Component }) => {
                  // Nested <Routes> match relative to the parent's matched segment
                  // ("/admin/*"), so absolute manifest paths must be stripped here.
                  const rel = path.replace(/^\/admin\/?/, '');
                  return rel === ''
                    ? <Route key={path} index element={<Component />} />
                    : <Route key={path} path={rel} element={<Component />} />;
                })}
              </Routes>
            </Suspense>
          </div>
        </div>
      </AdminAuthGate>
    </AdminSecretProvider>
  );
}

export default function App() {
  const { state } = useStore();
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminShell />} />
      <Route path="/screens" element={import.meta.env.DEV ? <ScreensIndex /> : <Navigate to="/home" replace />} />
      <Route path="/*" element={<MobileShell onboarded={state.settings.onboarded} />} />
    </Routes>
  );
}
