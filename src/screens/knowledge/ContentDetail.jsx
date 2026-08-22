import { useParams } from 'react-router-dom';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { useT } from '../../i18n/index.js';
import { findContent } from '../../lib/knowledgeContent.js';
import TopBar from '../../components/TopBar.jsx';
import StatusPill from '../../components/StatusPill.jsx';
import EmptyState from '../../components/EmptyState.jsx';

function Infographic({ info }) {
  if (!info) return null;

  if (info.type === 'table') {
    return (
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-2)' }}>
              {info.headers.map((h) => <th key={h} className="tiny" style={{ padding: 10, textAlign: 'start' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {info.rows.map((r, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--bg-2)' }}>
                {r.map((c, j) => <td key={j} className="small num" style={{ padding: 10 }}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (info.type === 'timeline') {
    return (
      <div className="col" style={{ gap: 10 }}>
        {info.items.map(([date, text], i) => (
          <div key={i} className="row" style={{ gap: 12 }}>
            <span className="pill teal num" style={{ flexShrink: 0 }}>{date}</span>
            <span className="small grow">{text}</span>
          </div>
        ))}
      </div>
    );
  }

  if (info.type === 'flow') {
    return (
      <div className="col" style={{ gap: 0 }}>
        {info.steps.map((s, i) => (
          <div key={i} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
            <div className="col" style={{ alignItems: 'center', gap: 0 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--teal-700)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
              {i < info.steps.length - 1 && <span style={{ width: 2, height: 28, background: 'var(--hairline)' }} />}
            </div>
            <span className="small" style={{ fontWeight: 600, paddingTop: 4 }}>{s}</span>
          </div>
        ))}
      </div>
    );
  }

  if (info.type === 'compare') {
    return (
      <div className="grid-2">
        {[info.left, info.right].map((side, i) => (
          <div key={i} className={`card inner ${i === 0 ? 'tint-teal' : 'tint-gray'}`}>
            <h3 style={{ marginBottom: 8 }}>{side.title}</h3>
            <div className="col" style={{ gap: 6 }}>
              {side.points.map((p) => (
                <span key={p} className="tiny row" style={{ gap: 6, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={13} color="var(--teal-700)" style={{ flexShrink: 0, marginTop: 2 }} /> {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (info.type === 'formula') {
    return (
      <div className="card tint-teal center">
        <span className="small" style={{ fontWeight: 700 }}>{info.line1}</span>
        <div className="tiny muted num" style={{ marginTop: 6 }}>{info.example}</div>
      </div>
    );
  }

  if (info.type === 'bracket') {
    return (
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-2)' }}>
              <th className="tiny" style={{ padding: 10, textAlign: 'start' }}>Tranche</th>
              <th className="tiny" style={{ padding: 10, textAlign: 'start' }}>Taux</th>
            </tr>
          </thead>
          <tbody>
            {info.brackets.map((b, i) => {
              const prev = i === 0 ? 0 : info.brackets[i - 1].upTo;
              const label = b.upTo === Infinity ? `Au-delà de ${prev.toLocaleString('fr-FR')} DT` : `De ${prev.toLocaleString('fr-FR')} à ${b.upTo.toLocaleString('fr-FR')} DT`;
              return (
                <tr key={i} style={{ borderTop: '1px solid var(--bg-2)' }}>
                  <td className="small num" style={{ padding: 10 }}>{label}</td>
                  <td className="small num" style={{ padding: 10, fontWeight: 600 }}>{Math.round(b.rate * 100)} %</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}

export default function ContentDetail() {
  const { type, slug } = useParams();
  const { t } = useT();
  const kind = type === 'law' ? 'law' : type === 'tax-guide' ? 'tax-guide' : type === 'finance-guide' ? 'finance-guide' : 'accounting-guide';
  const item = findContent(kind, slug);
  const needsVerification = /(vérifier|verify|cnss)/i.test(item?.badge || '');

  if (!item) {
    return (
      <div className="screen"><TopBar title={t('knowledge.title')} /><EmptyState text={t('money.noTx')} /></div>
    );
  }

  return (
    <div className="screen stagger">
      <TopBar title={item.num || t('knowledge.title')} />
      {/* Article content is French-only for now, so it's isolated as LTR even
          inside the Arabic/RTL app shell — otherwise numbers ("30 %") get
          bidi-reordered and read backwards. */}
      <div dir="ltr" className="col" style={{ gap: 16, textAlign: 'left' }}>
        <div className="col" style={{ gap: 8 }}>
          <div className="row" style={{ gap: 8 }}>
            {item.badge && <StatusPill tone={needsVerification ? 'warning' : 'success'}>{item.badge}</StatusPill>}
            {item.date && <span className="tiny muted num">{item.date}</span>}
            {item.min && <span className="tiny muted">{t('knowledge.readTime', { n: item.min })}</span>}
          </div>
          <h1>{item.title}</h1>
          <p className="small muted">{item.intro}</p>
        </div>

        <Infographic info={item.infographic} />

        {needsVerification && (
          <div className="card tint-amber small" role="note">
            {t('knowledge.verifyNotice')}
          </div>
        )}

        <div className="col" style={{ gap: 16 }}>
          {item.sections.map((s) => (
            <div key={s.heading} className="col" style={{ gap: 6 }}>
              <h3>{s.heading}</h3>
              <p className="small">{s.body}</p>
            </div>
          ))}
        </div>

        {item.sources?.length > 0 && (
          <section className="card tint-indigo col" style={{ gap: 8 }}>
            <h3>{t('knowledge.officialSources')}</h3>
            {item.sources.map((source) => (
              <a key={source.url} className="row small" style={{ gap: 8, color: 'var(--teal-800)' }} href={source.url} target="_blank" rel="noreferrer">
                <ExternalLink size={15} style={{ flexShrink: 0 }} /> {source.label}
              </a>
            ))}
          </section>
        )}
      </div>

      <p className="disclaimer">{t('disclaimer')}</p>
    </div>
  );
}
