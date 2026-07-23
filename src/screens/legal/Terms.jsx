import TopBar from '../../components/TopBar.jsx';

export default function Terms() {
  return (
    <div className="screen stagger">
      <TopBar title="Conditions d’utilisation" />
      <div className="col" style={{ gap: 16 }}>
        <p className="tiny muted">Dernière mise à jour : 23 juillet 2026</p>

        <section>
          <h3>1. Ce qu’est El Comptabli</h3>
          <p className="small">
            El Comptabli est un outil d’aide à la gestion fiscale et comptable destiné aux entrepreneurs
            tunisiens (freelances, patentes, sociétés). Il t’aide à suivre tes revenus et dépenses, à
            préparer tes déclarations et à comprendre tes obligations fiscales grâce à un assistant IA.
          </p>
        </section>

        <section>
          <h3>2. Ce que El Comptabli n’est pas</h3>
          <p className="small">
            El Comptabli n’est pas un expert-comptable, un avocat fiscaliste, ni un service de télédéclaration
            officiel. Les calculs, estimations et réponses de l’IA sont fournis à titre indicatif pour t’aider
            à comprendre ta situation — ils ne remplacent pas l’avis d’un professionnel et n’engagent pas
            El Comptabli en cas d’erreur de déclaration auprès de l’administration fiscale. Pour toute
            décision fiscale importante, consulte un expert-comptable.
          </p>
        </section>

        <section>
          <h3>3. Ton compte et tes données</h3>
          <p className="small">
            La majorité de tes données (transactions, documents, historique) sont stockées localement sur
            ton appareil. Ton nom, ton email et le statut de ton abonnement sont synchronisés sur nos
            serveurs afin de te permettre de retrouver ton accès si tu changes d’appareil. Voir la{' '}
            <a href="/legal/privacy" style={{ color: 'var(--teal-700)' }}>Politique de confidentialité</a> pour les détails.
          </p>
        </section>

        <section>
          <h3>4. Abonnement et paiement</h3>
          <p className="small">
            Les accès payants (1 jour / 1 semaine / 1 mois) s’activent via un code envoyé après un paiement
            confirmé manuellement par WhatsApp (Ooredoo, D17, e-Dinar). Un code d’activation est à usage
            unique et personnel — ne le partage pas. En cas de problème de paiement ou d’activation,
            contacte-nous directement par WhatsApp.
          </p>
        </section>

        <section>
          <h3>5. Utilisation raisonnable</h3>
          <p className="small">
            Merci de ne pas utiliser El Comptabli pour transmettre du contenu illégal, tenter d’accéder aux
            comptes d’autres utilisateurs, ou perturber le fonctionnement du service.
          </p>
        </section>

        <section>
          <h3>6. Contact</h3>
          <p className="small">
            Pour toute question sur ces conditions, contacte-nous sur WhatsApp au{' '}
            <span dir="ltr" style={{ fontWeight: 700, unicodeBidi: 'isolate' }}>+216 28 456 450</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
