import { useState } from 'react';
import { FileText, Folder } from 'lucide-react';

const TREE = {
  kb: { fiscalite: ['tva.md', 'irpp.md', 'forfaitaire.md'], comptabilite: ['plan-comptable.md', 'bilan.md'] },
};

export default function KnowledgeBaseManagement() {
  const [file, setFile] = useState('tva.md');

  return (
    <>
      <div className="row between">
        <h1>Base de connaissance</h1>
        <div className="row" style={{ gap: 10 }}>
          <span className="tiny muted">Dernière ingestion : il y a 2h</span>
          <button className="btn btn-primary btn-sm">Réingérer dans le RAG</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 1fr', gap: 20, flex: 1, minHeight: 500 }}>
        <div className="card" style={{ padding: 16 }}>
          {Object.entries(TREE.kb).map(([folder, files]) => (
            <div key={folder} style={{ marginBottom: 12 }}>
              <div className="row small" style={{ gap: 6, fontWeight: 600 }}><Folder size={14} /> {folder}/</div>
              {files.map((f) => (
                <button key={f} className={`row small ${file === f ? '' : ''}`} style={{ gap: 6, paddingInlineStart: 20, paddingBlock: 6, color: file === f ? 'var(--teal-700)' : 'var(--text)' }} onClick={() => setFile(f)}>
                  <FileText size={12} /> {f}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="row between" style={{ marginBottom: 10 }}>
            <span className="small" style={{ fontWeight: 600 }}>{file}</span>
            <select className="input" style={{ width: 160, minHeight: 32 }}>
              <option>verifie_2026</option>
              <option>a_verifier</option>
            </select>
          </div>
          <textarea className="input" style={{ minHeight: 380, fontFamily: 'monospace' }} defaultValue={'---\nstatut_verification: verifie_2026\n---\n\n# TVA\n\nLa TVA en Tunisie...'} />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <span className="small" style={{ fontWeight: 600 }}>Aperçu</span>
          <div className="small" style={{ marginTop: 10 }}>La TVA en Tunisie...</div>
        </div>
      </div>
    </>
  );
}
