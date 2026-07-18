import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import Toggle from '../../components/Toggle.jsx';

export default function TwoFactor() {
  const { toast } = useStore();
  const { t } = useT();
  const [on, setOn] = useState(false);

  return (
    <div className="screen stagger">
      <TopBar title={t('auth.twofaTitle')} subtitle={t('auth.twofaSub')} />
      <div className="card" style={{ alignItems: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ShieldCheck size={40} color="var(--teal-700)" />
        <div className="row between" style={{ width: '100%' }}>
          <span style={{ fontWeight: 600 }}>{t('auth.enable2fa')}</span>
          <Toggle on={on} onClick={() => { setOn((v) => !v); toast(t('common.saved')); }} />
        </div>
      </div>
      <p className="tiny center muted">{t('auth.demoNote')}</p>
    </div>
  );
}
