import { errors, isUuid } from './api.js';
import { getServiceClient } from './supabase.js';

export const ROLE_RANK = Object.freeze({ viewer: 0, employee: 1, accountant: 2, admin: 3, owner: 4 });

export async function listOrganizations(userId) {
  const { data, error } = await getServiceClient()
    .from('organization_members')
    .select('organization_id,role,status,joined_at,organizations(id,name,legal_name,tax_id,country,currency,fiscal_year_start,status)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map((membership) => ({ ...membership.organizations, role: membership.role, joinedAt: membership.joined_at }));
}

export async function requireOrganization(req, _res, next) {
  try {
    const requested = String(req.headers['x-organization-id'] || req.query?.organizationId || req.body?.organizationId || '');
    if (requested && !isUuid(requested)) throw errors.validation({ organizationId: 'UUID invalide' });
    let query = getServiceClient().from('organization_members')
      .select('organization_id,role,status,organizations(id,name,legal_name,tax_id,country,currency,fiscal_year_start,status)')
      .eq('user_id', req.user.id).eq('status', 'active');
    if (requested) query = query.eq('organization_id', requested);
    const { data, error } = await query.order('created_at', { ascending: true }).limit(1).maybeSingle();
    if (error) throw error;
    if (!data || data.organizations?.status !== 'active') throw errors.forbidden();
    req.organization = { id: data.organization_id, role: data.role, ...data.organizations };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireOrganizationRole(...roles) {
  return (req, _res, next) => roles.includes(req.organization?.role) ? next() : next(errors.forbidden());
}
