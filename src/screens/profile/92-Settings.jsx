import { useNavigate } from 'react-router-dom';
import { Download, Trash2, MailSearch, BookOpen } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';
import { useAuth } from '../../lib/auth.jsx';

export default function Settings() {
  const navigate = useNavigate();
  const { state, patch, exportData, reset, toast } = useStore();
  const { deleteAccount } = useAuth();
  const { t } = useT();
  const theme = state.settings.theme || 'light';
  const textSize = state.settings.textSize || 'normal';
  const currency = state.settings.currency || 'DT';

  return (
    <div className="screen stagger">
      <TopBar title={`${t('profile.settings')} ⚙️`} />

      <h3>Général</h3>
      <button className="card row between" style={{ width: '100%' }} onClick={() => navigate('/guide')}>
        <span className="small row" style={{ gap: 10 }}><BookOpen size={16} color="var(--teal-700)" /> {t('guide.aboutLink')}</span>
      </button>
      <button className="card row between" style={{ width: '100%' }} onClick={() => navigate('/profile/language')}>
        <span className="small">{t('profile.language')}</span><span className="tiny muted">{state.settings.lang === 'ar' ? 'عربي' : 'Français'}</span>
      </button>
      <div className="field">
        <label>{t('common.currency')}</label>
        <select className="input" value={currency} onChange={(e) => patch('settings', { currency: e.target.value })}>
          <option value="DT">DT · Dinar tunisien</option>
        </select>
      </div>
      <div className="field">
        <label>{t('common.theme')}</label>
        <SegmentedControl
          options={[{ id: 'light', label: t('common.themeLight') }, { id: 'dark', label: t('common.themeDark') }, { id: 'auto', label: t('common.themeAuto') }]}
          value={theme}
          onChange={(id) => patch('settings', { theme: id })}
        />
      </div>
      <div className="field">
        <label>{t('settings.textSize')}</label>
        <SegmentedControl
          options={[{ id: 'small', label: t('settings.textSmall') }, { id: 'normal', label: t('settings.textNormal') }, { id: 'large', label: t('settings.textLarge') }]}
          value={textSize}
          onChange={(id) => patch('settings', { textSize: id })}
        />
      </div>

      <h3>{t('backup.title')}</h3>
      <p className="tiny muted">{t('backup.hint')}</p>
      <button className="card row between" style={{ width: '100%' }} onClick={() => { exportData(); toast(t('backup.exported')); }}>
        <span className="small row" style={{ gap: 10 }}><Download size={16} color="var(--teal-700)" /> {t('backup.export')}</span>
      </button>
      <button className="card row between" style={{ width: '100%' }} onClick={() => navigate('/profile/recover')}>
        <span className="small row" style={{ gap: 10 }}><MailSearch size={16} color="var(--teal-700)" /> {t('recover.settingsLink')}</span>
      </button>
      <button className="card row between" style={{ width: '100%', color: 'var(--pill-danger-fg)' }} onClick={async () => {
        if (!confirm(t('backup.deleteConfirm'))) return;
        try {
          await deleteAccount();
          reset();
          toast(t('common.deleted'));
          navigate('/splash');
        } catch (error) {
          toast(error.message || 'Suppression impossible.', 'error');
        }
      }}>
        <span className="small row" style={{ gap: 10 }}><Trash2 size={16} /> {t('backup.delete')}</span>
      </button>

      <h3>IA</h3>
      <p className="tiny muted">{t('settings.aiAutoLang')}</p>

      <h3>À propos</h3>
      <div className="card row between"><span className="small">Version</span><span className="tiny muted num">1.0.0</span></div>
    </div>
  );
}
