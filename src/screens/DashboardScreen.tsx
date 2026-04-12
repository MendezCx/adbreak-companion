export default function DashboardScreen() {
  const networks = [
    { name: 'Unity Ads', pct: 41, color: '#4ADE80' },
    { name: 'ironSource', pct: 29, color: '#60A5FA' },
    { name: 'AppLovin', pct: 22, color: '#F87171', flag: '61s avg' },
    { name: 'AdMob', pct: 8, color: 'rgba(255,255,255,0.25)' },
  ];

  const alerts = [
    { dot: '#F87171', text: 'AppLovin avg 61s — above 45s threshold', tag: 'Warn', tagColor: '#F87171', tagBg: 'rgba(248,113,113,0.1)', cardBorder: 'rgba(248,113,113,0.2)' },
    { dot: '#FBBF24', text: 'Slow resume 6.1s — above 6s target', tag: 'Review', tagColor: '#FBBF24', tagBg: 'rgba(251,191,36,0.1)', cardBorder: 'rgba(255,255,255,0.07)' },
    { dot: '#4ADE80', text: 'Churn rate 1.8% — within target', tag: 'OK', tagColor: '#4ADE80', tagBg: 'rgba(74,222,128,0.1)', cardBorder: 'rgba(255,255,255,0.07)' },
  ];

  const card = (val: string, label: string, green: boolean, hero = false) => (
    <div style={{
      background: hero ? 'rgba(74,222,128,0.07)' : '#181828',
      border: `0.5px solid ${hero ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 8, padding: '10px 12px'
    }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: green ? '#4ADE80' : '#fff' }}>{val}</div>
      <div style={{ fontSize: 9, color: hero ? 'rgba(74,222,128,0.5)' : 'rgba(232,230,248,0.3)', marginTop: 3 }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>Session health</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {card('94%', 'Completion rate', true)}
        {card('1.8%', 'Churn after ad', false)}
        {card('3.2s', 'Resume time ★', true, true)}
        {card('23s', 'Avg break length', false)}
      </div>

      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>Network breakdown</div>
      <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
        {networks.map((n, i) => (
          <div key={i} style={{ marginBottom: i < networks.length - 1 ? 10 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: n.flag ? '#F87171' : 'rgba(232,230,248,0.55)' }}>{n.name}</span>
              <span style={{ fontSize: 10, color: n.color }}>{n.pct}%{n.flag ? ` · ${n.flag}` : ''}</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
              <div style={{ height: 3, width: `${n.pct}%`, background: n.color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>Active alerts</div>
      {alerts.map((a, i) => (
        <div key={i} style={{
          background: '#181828', border: `0.5px solid ${a.cardBorder}`,
          borderRadius: 8, padding: '11px 12px', marginBottom: 6,
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: a.dot, flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: 'rgba(232,230,248,0.85)', flex: 1, lineHeight: 1.4 }}>{a.text}</div>
          <span style={{
            fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
            background: a.tagBg, color: a.tagColor,
            border: `0.5px solid ${a.tagColor}40`, flexShrink: 0
          }}>{a.tag}</span>
        </div>
      ))}
    </div>
  );
}