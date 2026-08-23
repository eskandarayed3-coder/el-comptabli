const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SYNTHETIC_EMAIL = /^(?:anonymous|trial|guest)-[^@]+@trial\.invalid$/i;

const clean = (value) => typeof value === 'string' ? value.trim() : '';

export function isSyntheticAccountEmail(value) {
  const email = clean(value);
  return Boolean(email) && (email.toLowerCase().endsWith('@trial.invalid') || SYNTHETIC_EMAIL.test(email));
}

export function isUnsafeIdentityValue(value) {
  const text = clean(value);
  return Boolean(text) && (UUID.test(text) || isSyntheticAccountEmail(text) || /^(?:anonymous|trial|guest)-[0-9a-f-]{8,}$/i.test(text));
}

function explicitName(profile = {}) {
  const candidates = [
    profile.displayName,
    profile.display_name,
    [profile.firstName || profile.first_name, profile.lastName || profile.last_name].filter(Boolean).join(' '),
    profile.name,
  ];
  return candidates.map(clean).find((value) => value && !value.includes('@') && !isUnsafeIdentityValue(value)) || '';
}

function emailName(email) {
  const local = clean(email).split('@')[0] || '';
  if (!local || local.length > 48 || UUID.test(local) || /^[0-9a-f-]{16,}$/i.test(local)) return '';
  const readable = local.replace(/[._+-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return readable ? readable.charAt(0).toUpperCase() + readable.slice(1) : '';
}

export function getDisplayIdentity(user = {}, profile = {}, locale = 'fr') {
  const lang = String(locale || 'fr').toLowerCase().startsWith('ar') ? 'ar' : 'fr';
  const emails = [clean(user?.email), clean(profile?.email)];
  const displayEmail = emails.find((email) => email && !isSyntheticAccountEmail(email)) || '';
  const profileName = explicitName(profile);
  const isTrial = Boolean(
    user?.isAnonymous
    || user?.is_anonymous
    || profile?.isTrial
    || profile?.is_trial
    || profile?.accountType === 'trial'
    || profile?.account_type === 'trial'
    || emails.some(isSyntheticAccountEmail)
  );
  const trialName = lang === 'ar' ? 'حساب تجريبي مجاني' : 'Compte d’essai gratuit';
  const genericName = lang === 'ar' ? 'مستخدم' : 'Utilisateur';
  const derivedEmailName = displayEmail ? emailName(displayEmail) : '';
  const displayName = profileName || derivedEmailName || (isTrial ? trialName : genericName);
  const words = displayName.split(/\s+/).filter(Boolean);
  const initials = words.length > 1
    ? `${words[0][0]}${words[1][0]}`.toUpperCase()
    : (words[0]?.[0] || 'U').toUpperCase();

  return {
    displayName,
    displayEmail,
    showEmail: Boolean(displayEmail),
    initials,
    accountType: isTrial ? 'trial' : 'user',
    isTrial,
    nameSource: profileName ? 'profile' : (derivedEmailName ? 'email' : (isTrial ? 'trial' : 'generic')),
  };
}
