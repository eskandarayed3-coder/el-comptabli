// The 6 specialist agents. `photo` is the real avatar image (public/agents/*.png).
export const AGENTS = [
  { id: 'general', photo: '/agents/general.png', tone: 'teal', nameKey: 'agents.general.name', taglineKey: 'agents.general.tagline' },
  { id: 'comptabilite', photo: '/agents/comptabilite.png', tone: 'indigo', nameKey: 'agents.comptabilite.name', taglineKey: 'agents.comptabilite.tagline' },
  { id: 'fiscalite', photo: '/agents/fiscalite.png', tone: 'amber', nameKey: 'agents.fiscalite.name', taglineKey: 'agents.fiscalite.tagline' },
  { id: 'droit', photo: '/agents/droit.png', tone: 'coral', nameKey: 'agents.droit.name', taglineKey: 'agents.droit.tagline' },
  { id: 'finance', photo: '/agents/finance.png', tone: 'teal', nameKey: 'agents.finance.name', taglineKey: 'agents.finance.tagline' },
  { id: 'tunisie', photo: '/agents/tunisie.png', tone: 'indigo', nameKey: 'agents.tunisie.name', taglineKey: 'agents.tunisie.tagline' },
];

export function agentById(id) {
  return AGENTS.find((a) => a.id === id) || AGENTS[0];
}
