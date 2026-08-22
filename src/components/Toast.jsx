import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { useStore } from '../lib/store.jsx';

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const EXIT_MS = 180;

export default function Toast() {
  const { state, patch } = useStore();
  const toast = state.ui.toast;
  const [shown, setShown] = useState(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (toast) {
      setShown(toast);
      setLeaving(false);
      const t = setTimeout(() => patch('ui', { toast: null }), 2400);
      return () => clearTimeout(t);
    }
    if (shown) {
      setLeaving(true);
      const t = setTimeout(() => setShown(null), EXIT_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [toast]);

  if (!shown) return null;
  const Icon = ICONS[shown.kind] || Info;
  return (
    <div className="toast-wrap">
      <div className={`toast ${shown.kind}${leaving ? ' leaving' : ''}`} key={shown.id} role={shown.kind === 'error' ? 'alert' : 'status'} aria-live={shown.kind === 'error' ? 'assertive' : 'polite'} aria-atomic="true">
        <Icon size={16} aria-hidden="true" />
        <span>{shown.message}</span>
      </div>
    </div>
  );
}
