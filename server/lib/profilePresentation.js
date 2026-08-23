import { getDisplayIdentity } from '../../shared/displayIdentity.js';

export function profilePresentation(profile = {}, user = {}, locale = 'fr') {
  const identity = getDisplayIdentity(user, profile, locale);
  return {
    name: identity.nameSource === 'profile' ? identity.displayName : '',
    email: identity.displayEmail,
    regime: profile.regime || 'reel',
    userType: profile.user_type || profile.userType || 'freelance',
    city: profile.city || '',
    activity: profile.activity || '',
    phone: profile.phone || '',
    sector: profile.sector || '',
    taxId: profile.tax_id || profile.taxId || '',
    companyName: profile.company_name || profile.companyName || '',
  };
}
