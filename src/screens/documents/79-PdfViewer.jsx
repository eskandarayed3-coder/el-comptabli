import { ZoomIn, Pencil, Share2, Download, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';

export default function PdfViewer() {
  const { toast } = useStore();
  const { t } = useT();

  return (
    <div className="screen no-nav stagger">
      <TopBar title="Aperçu du document" />
      <div style={{ flex: 1, borderRadius: 16, background: 'var(--bg-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
        <span style={{ fontSize: 40 }}>📄</span>
      </div>
      <div className="row between" style={{ padding: '8px 0' }}>
        {[ZoomIn, Pencil, Share2, Download].map((Icon, i) => (
          <button key={i} className="icon-btn" onClick={() => toast(t('common.saved'))}><Icon size={18} /></button>
        ))}
      </div>
      <button className="btn btn-primary btn-block" onClick={() => toast(t('common.saved'))}>
        <Sparkles size={16} /> Extraire les données ✨
      </button>
    </div>
  );
}
