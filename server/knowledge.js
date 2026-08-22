import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KB_DIR = path.join(__dirname, '..', 'kb');

// Official portals are used as source-of-truth links. We keep the text cache
// local and versioned so a remote page cannot silently change an AI answer.
const OFFICIAL_SOURCES = [
  { id: 'jibaya', title: 'JIBAYA — portail de l’administration fiscale tunisienne', url: 'https://jibaya.tn/' },
  { id: 'idaraty', title: 'Idaraty — procédures et informations administratives tunisiennes', url: 'https://idaraty.tn/' },
];

const STOP_WORDS = new Set([
  'avec', 'dans', 'pour', 'sans', 'sur', 'une', 'des', 'les', 'est', 'que', 'qui', 'quoi',
  'comment', 'quel', 'quelle', 'quels', 'quelles', 'mon', 'ma', 'mes', 'ton', 'ta', 'tes',
  'son', 'ses', 'the', 'and', 'from', 'this', 'that', 'what', 'how', 'need', 'dois', 'faire',
  'je', 'tu', 'il', 'elle', 'on', 'nous', 'vous', 'ils', 'elles', 'de', 'du', 'au', 'aux',
  'un', 'et', 'ou', 'en', 'à', 'a', 'le', 'la', 'l', 'd', 'par', 'se', 'ce', 'cette', 'ces',
]);

const DOMAIN_BY_AGENT = {
  fiscalite: 'fiscalite',
  comptabilite: 'comptabilite',
  finance: 'finance',
  tunisie: 'administratif',
};

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}%]+/gu, ' ')
    .trim();
}

function tokens(value) {
  return new Set(normalize(value).split(/\s+/).filter((token) => token.length >= 3 && !STOP_WORDS.has(token)));
}

function frontmatter(text) {
  const match = String(text).match(/^---\s*\n([\s\S]*?)\n---/);
  const fields = {};
  if (!match) return { fields, body: String(text) };
  for (const line of match[1].split('\n')) {
    const item = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (!item) continue;
    fields[item[1].toLowerCase()] = item[2].replace(/^['"]|['"]$/g, '').trim();
  }
  return { fields, body: String(text).slice(match[0].length).trim() };
}

function readChunks() {
  if (!fs.existsSync(KB_DIR)) return [];
  const files = fs.readdirSync(KB_DIR).filter((file) => file.endsWith('.md')).sort();
  const chunks = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(KB_DIR, file), 'utf8');
    const { fields, body } = frontmatter(raw);
    const sections = body.split(/\n(?=##\s+)/).map((part) => part.trim()).filter(Boolean);
    for (const section of sections) {
      const heading = section.match(/^##\s+(.+)$/m)?.[1]?.trim() || fields.titre || file;
      const content = section.replace(/^##\s+.+$/m, '').trim();
      if (!content) continue;
      chunks.push({
        file,
        title: heading,
        content: content.slice(0, 2600),
        domain: fields.domaine || 'general',
        status: fields.statut_verification || 'a_verifier',
        source: fields.sources || 'Base de connaissances El Comptabli',
        tags: fields.tags || '',
        searchable: normalize(`${heading} ${content} ${fields.domaine || ''} ${fields.tags || ''}`),
      });
    }
  }
  return chunks;
}

let cachedChunks = null;
function allChunks() {
  if (!cachedChunks) cachedChunks = readChunks();
  return cachedChunks;
}

export function retrieveKnowledge(question, { agentId = 'general', limit = 5 } = {}) {
  const queryTokens = tokens(question);
  const domain = DOMAIN_BY_AGENT[agentId];
  const scored = allChunks().map((chunk) => {
    const haystack = tokens(chunk.searchable);
    let score = 0;
    for (const token of queryTokens) if (haystack.has(token)) score += 1;
    if (domain && chunk.domain === domain) score += 1.5;
    if (normalize(question).includes(normalize(chunk.title))) score += 3;
    return { ...chunk, score };
  }).filter((chunk) => chunk.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
  return scored;
}

export function buildKnowledgeContext(question, options = {}) {
  const matches = retrieveKnowledge(question, options);
  const sources = OFFICIAL_SOURCES;
  const context = matches.length
    ? matches.map((item, index) => [
      `FICHE ${index + 1}: ${item.title}`,
      `Fichier: ${item.file}`,
      `Domaine: ${item.domain}`,
      `Statut: ${item.status}`,
      `Source déclarée: ${item.source}`,
      item.content,
    ].join('\n')).join('\n\n')
    : 'Aucune fiche locale suffisamment pertinente pour cette question.';

  const sourceList = sources.map((source) => `${source.title} — ${source.url}`).join('\n');
  const prompt = `\n\n=== CONTEXTE DE CONNAISSANCE EL COMPTABLI ===\n${context}\n\nPORTAILS OFFICIELS À CONSULTER POUR CONFIRMATION:\n${sourceList}\n\nRÈGLES DU CONTEXTE:\n- Utilise d'abord les fiches fournies, mais respecte toujours leur statut de vérification.\n- Une fiche "a_verifier" ne doit jamais être présentée comme une règle certaine.\n- Si une information manque ou peut avoir changé, dis-le clairement et donne le lien officiel pertinent.\n- Ne fabrique jamais un taux, seuil, date limite, pénalité ou numéro de compte.\n- Termine une réponse fiscale ou administrative par une courte note de vérification professionnelle.\n=== FIN DU CONTEXTE ===`;
  return { prompt, sources, matches: matches.map(({ file, title, status }) => ({ file, title, status })) };
}

export function resetKnowledgeCache() {
  cachedChunks = null;
}

export { OFFICIAL_SOURCES };
