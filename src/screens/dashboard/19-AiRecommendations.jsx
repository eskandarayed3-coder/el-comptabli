import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useT } from '../../i18n/index.js';
import TopBar from '../../components/TopBar.jsx';
import TintCard from '../../components/TintCard.jsx';

export default function AiRecommendations() {
  const navigate = useNavigate();
  const { t, lang } = useT();

  const RECOS = [
    {
      text: { fr: 'Tes dépenses carburant ont augmenté de 30 %, voir le détail', ar: 'مصاريف الإسانس زادت 30%، شوف التفاصيل' },
      action: () => navigate('/expenses'),
    },
    {
      text: { fr: 'Tu peux économiser 96 DT de TVA déductible sur tes achats, comment ?', ar: 'تنجم توفر 96 دينار TVA قابلة للخصم على شراءاتك، كيفاش؟' },
      action: () => navigate('/chat?q=' + encodeURIComponent('Comment économiser sur ma TVA déductible ?')),
    },
    {
      text: { fr: 'Ton acompte provisionnel arrive le 25 sept, estimer le montant', ar: 'التسبقة متاعك جاية في 25 سبتمبر، قدّر المبلغ' },
      action: () => navigate('/tax/estimate'),
    },
    {
      text: { fr: '3 factures scannées attendent validation, valider', ar: '3 فواتير مسكانية يستناو في التثبيت، ثبّت' },
      action: () => navigate('/scanner/review'),
    },
  ];

  return (
    <div className="screen stagger">
      <TopBar title={t('home.recoTitle')} />
      <div className="col" style={{ gap: 12 }}>
        {RECOS.map((r, i) => (
          <TintCard key={i} tone="indigo" onClick={r.action}>
            <div className="col" style={{ gap: 8 }}>
              <div className="row" style={{ gap: 8 }}>
                <Sparkles size={16} color="#4F46E5" />
                <span className="small" style={{ fontWeight: 600 }}>{r.text[lang] || r.text.fr}</span>
              </div>
              <span className="tiny muted">{t('home.recoBased')}</span>
            </div>
          </TintCard>
        ))}
      </div>
    </div>
  );
}
