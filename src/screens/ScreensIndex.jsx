import { Link } from 'react-router-dom';
import { manifest, adminManifest } from '../routes.js';

export default function ScreensIndex() {
  const modules = [...new Set(manifest.map((m) => m.module))];
  return (
    <div className="screens-index">
      <h1>El Comptabli · Index des écrans ({manifest.length + adminManifest.length}/120)</h1>
      {modules.map((mod) => (
        <div key={mod}>
          <h3>{mod}</h3>
          <div className="mod">
            {manifest.filter((m) => m.module === mod).map((m) => (
              <Link key={m.path} className={`chip ${m.mvp ? 'outline-teal' : ''}`} to={m.path}>
                {m.mvp ? '🎯 ' : ''}{m.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
      {adminManifest.length > 0 && (
        <div>
          <h3>Admin (desktop)</h3>
          <div className="mod">
            {adminManifest.map((m) => (
              <Link key={m.path} className="chip" to={m.path}>{m.label}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
