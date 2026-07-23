import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Upload, RotateCcw, Trash2, MailSearch, BookOpen } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import SegmentedControl from '../../components/SegmentedControl.jsx';

export default function Settings() {
  const navigate = useNavigate();
  const { state, patch, exportData, importData, reset, toast } = useStore();
  const { t } = useT();
  const fileRef = useRef(null);
  const theme = state.settings.theme || 'light';
  const textSize = state.settings.textSize || 'normal';
  const currency = state.settings.currency || 'DT';

  const onImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        if (!json || typeof json !== 'object' || !json.settings) throw new Error('format');
        importData(json);
        toast(t('backup.imported'));
      } catch {
        toast(t('backup.importError'), 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

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
      <button className="card row between" style={{ width: '100%' }} onClick={() => fileRef.current?.click()}>
        <span className="small row" style={{ gap: 10 }}><Upload size={16} color="var(--teal-700)" /> {t('backup.import')}</span>
      </button>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImportFile} />
      <button className="card row between" style={{ width: '100%' }} onClick={() => navigate('/profile/recover')}>
        <span className="small row" style={{ gap: 10 }}><MailSearch size={16} color="var(--teal-700)" /> {t('recover.settingsLink')}</span>
      </button>
      <button className="card row between" style={{ width: '100%' }} onClick={() => { if (confirm(t('backup.resetConfirm'))) { reset(); toast(t('common.saved')); } }}>
        <span className="small row" style={{ gap: 10 }}><RotateCcw size={16} color="var(--text-2)" /> {t('backup.reset')}</span>
      </button>
      <button className="card row between" style={{ width: '100%', color: 'var(--pill-danger-fg)' }} onClick={() => { if (confirm(t('backup.deleteConfirm'))) { localStorage.removeItem('elcomptabli:v1'); reset(); toast(t('common.deleted')); } }}>
        <span className="small row" style={{ gap: 10 }}><Trash2 size={16} /> {t('backup.delete')}</span>
      </button>

      <h3>IA</h3>
      <p className="tiny muted">{t('settings.aiAutoLang')}</p>

      <h3>À propos</h3>
      <div className="card row between"><span className="small">Version</span><span className="tiny muted num">1.0.0</span></div>
    </div>
  );
}
