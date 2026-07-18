import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, FileText } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import Toggle from '../../components/Toggle.jsx';

export default function UploadDocument() {
  const navigate = useNavigate();
  const { toast } = useStore();
  const { t } = useT();
  const [type, setType] = useState('Facture');
  const [ai, setAi] = useState(true);

  const pickFile = () => navigate('/scanner');

  const OPTIONS = [
    { icon: Camera, label: 'Scanner avec l’appareil' },
    { icon: Image, label: 'Depuis la galerie' },
    { icon: FileText, label: 'Importer un PDF' },
  ];

  return (
    <div className="screen stagger">
      <TopBar title={t('docs.upload')} />
      <div className="col" style={{ gap: 10 }}>
        {OPTIONS.map((o) => (
          <button key={o.label} className="card row" style={{ width: '100%', gap: 12 }} onClick={pickFile}>
            <span className="icon-wrap teal"><o.icon size={18} /></span>
            <span style={{ fontWeight: 600 }}>{o.label}</span>
          </button>
        ))}
      </div>
      <div className="field">
        <label>{t('common.category')}</label>
        <div className="row" style={{ gap: 8 }}>
          {['Facture', 'Reçu', 'Déclaration', 'Autre'].map((ty) => (
            <button key={ty} className={`chip ${type === ty ? 'active' : ''}`} onClick={() => setType(ty)}>{ty}</button>
          ))}
        </div>
      </div>
      <div className="card row between">
        <span className="small" style={{ fontWeight: 600 }}>Analyser avec l’IA (extraction auto)</span>
        <Toggle on={ai} onClick={() => setAi((v) => !v)} />
      </div>
      <button className="btn btn-primary btn-block" onClick={() => { toast(t('common.saved')); navigate('/documents'); }}>{t('common.add')}</button>
    </div>
  );
}
