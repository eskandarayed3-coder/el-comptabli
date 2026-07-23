import TopBar from '../../components/TopBar.jsx';

export default function Privacy() {
  return (
    <div className="screen stagger">
      <TopBar title="Politique de confidentialité" />
      <div className="col" style={{ gap: 16 }}>
        <p className="tiny muted">Dernière mise à jour : 23 juillet 2026</p>

        <section>
          <h3>1. Quelles données nous collectons</h3>
          <p className="small">
            Lors de l’inscription, nous te demandons ton nom et ton email. Nous synchronisons aussi ton
            type d’activité, ta ville, ton régime fiscal et le statut de ton abonnement (gratuit/premium).
            Tes transactions, documents scannés et conversations avec l’IA restent stockés uniquement sur
            ton appareil (dans ton navigateur) — ils ne sont pas envoyés à nos serveurs.
          </p>
        </section>

        <section>
          <h3>2. Pourquoi nous les collectons</h3>
          <p className="small">
            Ton nom et ton email servent uniquement à te permettre de retrouver ton accès si tu changes
            d’appareil ou vides le cache de ton navigateur (fonction « Récupérer mon accès » dans Profil).
            Sans cela, un abonnement payant serait définitivement perdu en cas de changement de téléphone.
          </p>
        </section>

        <section>
          <h3>3. Où sont stockées les données</h3>
          <p className="small">
            Les données de compte (nom, email, plan) sont hébergées chez Supabase, un fournisseur
            d’infrastructure cloud sécurisé (chiffrement en transit et au repos). L’accès à ces données
            est protégé et limité à des opérations précises nécessaires au fonctionnement du service.
          </p>
        </section>

        <section>
          <h3>4. Partage avec des tiers</h3>
          <p className="small">
            Nous ne vendons ni ne partageons tes données personnelles avec des tiers à des fins publicitaires.
            Quand tu utilises l’assistant IA ou le scanner de documents, le contenu de ta question ou de ton
            document est transmis à un fournisseur d’intelligence artificielle (Groq, Mistral ou Google Gemini
            selon la configuration) uniquement pour générer la réponse — ce contenu n’est pas conservé par
            El Comptabli au-delà de la session.
          </p>
        </section>

        <section>
          <h3>5. Tes droits</h3>
          <p className="small">
            Tu peux à tout moment supprimer toutes tes données locales depuis Profil → Paramètres →
            « Supprimer mes données ». Pour demander la suppression de ton compte côté serveur (nom, email,
            historique d’abonnement), contacte-nous sur WhatsApp au{' '}
            <span dir="ltr" style={{ fontWeight: 700, unicodeBidi: 'isolate' }}>+216 28 456 450</span>{' '}
            — la demande sera traitée sous 7 jours, conformément aux principes de la loi tunisienne relative
            à la protection des données à caractère personnel.
          </p>
        </section>

        <section>
          <h3>6. Sécurité des paiements</h3>
          <p className="small">
            El Comptabli ne stocke aucune donnée bancaire ou de carte. Les paiements se font directement via
            Ooredoo, D17 ou e-Dinar, en dehors de l’application, puis confirmés manuellement par WhatsApp.
          </p>
        </section>
      </div>
    </div>
  );
}
