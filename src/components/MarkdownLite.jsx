// Lightweight renderer for AI answers. The system prompts forbid Markdown,
// but LLMs still slip into "|" tables for tabular data (journal entries) and
// "**bold**" for emphasis, and often mix a plain intro sentence with a run of
// "- " list lines in the same paragraph. This renders each of those cases
// properly instead of showing literal pipes/asterisks/dashes.

function InlineText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function isTableBlock(lines) {
  return lines.length >= 2 && lines[0].trim().startsWith('|') && /^\|?[\s:-]+\|/.test(lines[1]);
}

function Table({ lines }) {
  const rows = lines
    .filter((l) => !/^\|?[\s:-]+\|/.test(l))
    .map((l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
  const [headers, ...body] = rows;
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', margin: '4px 0' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-2)' }}>
              {headers.map((h, j) => <th key={j} className="tiny" style={{ padding: 8, textAlign: 'start', whiteSpace: 'nowrap' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {body.map((r, ri) => (
              <tr key={ri} style={{ borderTop: '1px solid var(--bg-2)' }}>
                {r.map((c, ci) => <td key={ci} className="small num" style={{ padding: 8, whiteSpace: 'nowrap' }}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BulletList({ lines }) {
  return (
    <div className="col" style={{ gap: 4 }}>
      {lines.map((l, i) => (
        <div key={i} className="row small" style={{ gap: 8, alignItems: 'flex-start' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--teal-700)', flexShrink: 0, marginTop: 8 }} />
          <span className="grow"><InlineText text={l.trim().replace(/^[-*]\s+/, '')} /></span>
        </div>
      ))}
    </div>
  );
}

// Groups consecutive lines into runs of the same kind (bullet vs plain text),
// so an intro sentence followed by a "- " list renders as prose + a real
// bullet list instead of one block forcing an all-or-nothing choice.
function segments(lines) {
  const groups = [];
  for (const line of lines) {
    const type = /^[-*]\s+/.test(line.trim()) ? 'bullet' : 'text';
    const last = groups[groups.length - 1];
    if (last && last.type === type) last.lines.push(line);
    else groups.push({ type, lines: [line] });
  }
  return groups;
}

function Segments({ lines, keyPrefix }) {
  return segments(lines).map((seg, i) => {
    const key = `${keyPrefix}-${i}`;
    if (seg.type === 'bullet') return <BulletList key={key} lines={seg.lines} />;
    return <p key={key} className="small" style={{ whiteSpace: 'pre-wrap' }}><InlineText text={seg.lines.join('\n')} /></p>;
  });
}

export default function MarkdownLite({ text }) {
  if (!text) return null;
  const blocks = text.split(/\n{2,}/);

  return (
    <div className="col" style={{ gap: 10 }}>
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter((l) => l.trim());
        if (lines.length === 0) return null;

        if (isTableBlock(lines)) return <Table key={i} lines={lines} />;

        const headingMatch = lines[0].match(/^(\d+)\.\s*(.+)$/);
        if (headingMatch) {
          const [, num, headingText] = headingMatch;
          const rest = lines.slice(1);
          return (
            <div key={i} className="col" style={{ gap: 6 }}>
              <p className="small" style={{ fontWeight: 700 }}>{num}. <InlineText text={headingText} /></p>
              {rest.length > 0 && <Segments lines={rest} keyPrefix={`h${i}`} />}
            </div>
          );
        }

        return <div key={i} className="col" style={{ gap: 6 }}><Segments lines={lines} keyPrefix={`b${i}`} /></div>;
      })}
    </div>
  );
}
