import { Suspense, useEffect, useReducer } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav.jsx';
import Toast from './components/Toast.jsx';
import LockScreen from './components/LockScreen.jsx';
import Sidebar from './components/admin/Sidebar.jsx';
import { useStore, isPremium } from './lib/store.jsx';
import { isPaywallAllowed } from './lib/paywall.js';
import { manifest, adminManifest } from './routes.js';
import ScreensIndex from './screens/ScreensIndex.jsx';

const NAV_PATHS = ['/home', '/chat', '/scanner', '/finance', '/knowledge', '/profile'];

function MobileShell({ onboarded }) {
  const location = useLocation();
  const { state } = useStore();
  const premiumUntil = state.settings.premiumUntil;

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
  // independent of the mobile app's user-facing language setting.
  return (
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
  );
}

export default function App() {
  const { state } = useStore();
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminShell />} />
      <Route path="/screens" element={<ScreensIndex />} />
      <Route path="/*" element={<MobileShell onboarded={state.settings.onboarded} />} />
    </Routes>
  );
}
