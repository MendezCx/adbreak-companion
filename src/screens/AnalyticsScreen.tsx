interface Props { onRunSim: () => void; }

export default function AnalyticsScreen({ onRunSim }: Props) {
  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>

      {/* Auto-suggest */}
      <div style={{ background: 'rgba(96,165,250,0.07)', border: '0.5px solid rgba(96,165,250,0.2)', borderRadius: 12, padding: 13, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#A78BFA' }} />
          <span style={{ fontSize: 9, fontWeight: 600, color: '#A78BFA', letterSpacing: '.04em' }}>Auto-suggest</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(232,230,248,0.55)', lineHeight: 1.5, marginBottom: 10 }}>
          High churn detected from AppLovin on Fridays. Want to simulate this condition now?
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onRunSim} style={{ flex: 1, padding: 8, background: '#60A5FA', border: 'none', borderRadius: 7, color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>Run simulation</button>
          <button style={{ flex: 1, padding: 8, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 7, color: 'rgba(232,230,248,0.55)', fontSize: 10, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>Dismiss</button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 10 }}>Completions vs churn · 7 days</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(232,230,248,0.55)' }}>
            <div style={{ width: 14, height: 2, background: '#4ADE80', borderRadius: 1 }} />
            <span>Completions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(232,230,248,0.55)' }}>
            <div style={{ width: 14, height: 2, background: '#F87171', borderRadius: 1, borderTop: '1.5px dashed #F87171', backgroundColor: 'transparent' }} />
            <span>Post-break churn</span>
          </div>
        </div>
        <svg width="100%" viewBox="0 0 320 90" style={{ display: 'block' }}>
          <line x1="0" y1="70" x2="320" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1="0" y1="45" x2="320" y2="45" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <polyline points="0,55 53,48 106,42 160,36 213,50 266,43 320,33" fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="0,68 53,65 106,62 160,58 213,70 266,66 320,60" fill="none" stroke="#F87171" strokeWidth="1.5" strokeDasharray="3,2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="213" cy="50" r="4" fill="none" stroke="#FBBF24" strokeWidth="1.5" />
          <circle cx="213" cy="70" r="4" fill="none" stroke="#FBBF24" strokeWidth="1.5" />
          <text x="213" y="16" textAnchor="middle" fill="#FBBF24" fontSize="7" fontFamily="'JetBrains Mono', monospace">Fri spike</text>
          {['Mon','Wed','Fri','Sun'].map((d, i) => (
            <text key={d} x={[10,95,195,295][i]} y="84" fill="rgba(232,230,248,0.25)" fontSize="7" fontFamily="'JetBrains Mono', monospace">{d}</text>
          ))}
        </svg>
      </div>

      {/* Ad length distribution */}
      <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 10 }}>Ad length distribution</div>
        {[
          { label: '0–15s', pct: 15, color: '#4ADE80' },
          { label: '15–30s', pct: 52, color: '#4ADE80' },
          { label: '30–60s', pct: 24, color: '#FBBF24' },
          { label: '60s+', pct: 9, color: '#F87171' },
        ].map((b, i) => (
          <div key={i} style={{ marginBottom: i < 3 ? 7 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, marginBottom: 3 }}>
              <span style={{ color: b.color === '#F87171' ? '#F87171' : 'rgba(232,230,248,0.55)' }}>{b.label}</span>
              <span style={{ color: b.color }}>{b.pct}%</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
              <div style={{ height: 3, width: `${b.pct}%`, background: b.color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>Recommendations</div>
      <div style={{ background: 'rgba(251,191,36,0.06)', border: '0.5px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FBBF24', marginTop: 3, flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: 'rgba(232,230,248,0.55)', lineHeight: 1.5 }}>Cap AppLovin interstitials — 9% are 60s+, driving 2.1× churn vs other networks</div>
        </div>
        <button onClick={onRunSim} style={{ width: '100%', padding: 7, background: 'rgba(96,165,250,0.15)', border: '0.5px solid rgba(96,165,250,0.3)', borderRadius: 7, color: '#60A5FA', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>Run simulation</button>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 12px' }}>
        <div style={{ display: 'flex', gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', marginTop: 3, flexShrink: 0 }} />
          <div style={{ fontSize: 11, color: 'rgba(232,230,248,0.55)', lineHeight: 1.5 }}>Reduce interstitial frequency after level 5 on Fridays — spike pattern confirmed</div>
        </div>
      </div>
    </div>
  );
}