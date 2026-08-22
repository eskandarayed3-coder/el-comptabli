import test from 'node:test';
import assert from 'node:assert/strict';
import { buildKnowledgeContext, retrieveKnowledge } from '../knowledge.js';

test('retrieves Tunisian VAT knowledge for a TVA question', () => {
  const matches = retrieveKnowledge('comment calculer la TVA collectée et déductible ?', { agentId: 'fiscalite' });
  assert.ok(matches.some((match) => /tva/i.test(`${match.file} ${match.title}`)));
});

test('knowledge context always carries official verification links', () => {
  const context = buildKnowledgeContext('quelle démarche fiscale dois-je faire ?', { agentId: 'tunisie' });
  assert.match(context.prompt, /https:\/\/jibaya\.tn\//);
  assert.match(context.prompt, /https:\/\/idaraty\.tn\//);
  assert.equal(context.sources.length, 2);
});
