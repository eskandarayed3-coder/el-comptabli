import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Camera, HardDrive } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import Toggle from '../../components/Toggle.jsx';

export default function Permissions() {
  const navigate = useNavigate();
  const { state, patch } = useStore();
  const { t } = useT();
  const [perms, setPerms] = useState({
    notifications: state.settings.notifications,
    camera: state.settings.camera,
    storage: state.settings.storage,
  });

  const toggle = (k) => setPerms((p) => ({ ...p, [k]: !p[k] }));

  const finish = () => {
    patch('settings', perms);
    navigate('/setup-complete');
  };

  const ITEMS = [
    { key: 'notifications', icon: Bell, title: t('onboarding.permNotif'), sub: t('onboarding.permNotifEx') },
    { key: 'camera', icon: Camera, title: t('onboarding.permCam'), sub: t('onboarding.permCamEx') },
    { key: 'storage', icon: HardDrive, title: t('onboarding.permStorage'), sub: t('onboarding.permStorageEx') },
  ];

  return (
    <div className="screen stagger">
      <h1>{t('onboarding.permTitle')}</h1>
      <div className="col" style={{ gap: 12 }}>
        {ITEMS.map(({ key, icon: Icon, title, sub }) => (
          <div key={key} className="card row between">
            <span className="row" style={{ gap: 12 }}>
              <span className="icon-wrap teal"><Icon size={18} /></span>
              <span className="col" style={{ gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{title}</span>
                <span className="tiny muted">{sub}</span>
              </span>
            </span>
            <Toggle on={perms[key]} onClick={() => toggle(key)} />
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-primary btn-block" onClick={finish}>{t('onboarding.finish')}</button>
    </div>
  );
}
