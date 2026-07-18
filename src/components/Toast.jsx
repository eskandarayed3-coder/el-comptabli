import { useEffect } from 'react';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { useStore } from '../lib/store.jsx';

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };

export default function Toast() {
  const { state, patch } = useStore();
  const toast = state.ui.toast;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => patch('ui', { toast: null }), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  const Icon = ICONS[toast.kind] || Info;
  return (
    <div className="toast-wrap">
      <div className={`toast ${toast.kind}`} key={toast.id}>
        <Icon size={16} />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
