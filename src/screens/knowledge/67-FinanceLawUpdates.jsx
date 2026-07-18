import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { LAWS } from '../../lib/knowledgeContent.js';
import TopBar from '../../components/TopBar.jsx';

const lf = LAWS['lf-2026'];

export default function FinanceLawUpdates() {
  const navigate = useNavigate();
  const { t } = useT();
  return (
    <div className="screen stagger">
      <TopBar title={`${t('knowledge.lawUpdates')} 2026 🆕`} />
      <button className="card tint-indigo" style={{ width: '100%', textAlign: 'start' }} onClick={() => navigate('/knowledge/read/law/lf-2026')}>
        <div className="row between" style={{ marginBottom: 10 }}>
          <h3>Ce qui change pour toi en 2026</h3>
          <ChevronRight size={16} />
        </div>
        <div className="col" style={{ gap: 10 }}>
          {lf.sections.map((s) => (
            <span key={s.heading} className="small">• {s.heading}</span>
          ))}
        </div>
      </button>
      <div className="col" style={{ gap: 10 }}>
        {lf.infographic.items.map(([date, text], i) => (
          <div key={i} className="row" style={{ gap: 12 }}>
            <span className="pill teal num" style={{ flexShrink: 0 }}>{date}</span>
            <span className="small grow">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
