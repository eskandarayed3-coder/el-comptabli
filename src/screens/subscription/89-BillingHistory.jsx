import { useStore, isPremium as checkPremium } from '../../lib/store.jsx';
import { useT } from '../../i18n/index.js';
import { fmtDate } from '../../lib/format.js';
import TopBar from '../../components/TopBar.jsx';

export default function BillingHistory() {
  const { state } = useStore();
  const { t, lang } = useT();
  const isPremium = checkPremium(state.settings);

  return (
    <div className="screen stagger">
      <TopBar title={`${t('sub.billing')}`} />
      <div className="card row between">
        <span className="col">
          <span style={{ fontWeight: 700 }}>{isPremium ? 'Premium' : t('common.free')}</span>
          {isPremium && state.settings.premiumUntil && (
            <span className="tiny muted">Actif jusqu’au {fmtDate(state.settings.premiumUntil, lang)}</span>
          )}
        </span>
      </div>

      {/* Paiement manuel par code WhatsApp, pas d'abonnement récurrent — il
          n'y a donc pas d'historique de facturation à afficher ici. */}
      <p className="small muted center">
        {isPremium
          ? 'Activation par code, pas de facturation récurrente à afficher ici.'
          : 'Aucune activation pour l’instant.'}
      </p>

    </div>
  );
}
