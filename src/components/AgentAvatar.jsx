// Real agent mascot photo (public/agents/*.png), shown as a rounded avatar
// with a soft tone-tinted ring matching the agent's specialty color.
const TONE_RING = {
  teal: 'var(--teal-400)',
  indigo: '#818CF8',
  amber: '#F59E0B',
  coral: '#F87171',
};

export default function AgentAvatar({ agent, size = 40 }) {
  const ring = TONE_RING[agent.tone] || TONE_RING.teal;
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        overflow: 'hidden', border: `2px solid ${ring}`, background: '#fff',
      }}
    >
      <img src={agent.photo} alt="" width={size} height={size} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}
