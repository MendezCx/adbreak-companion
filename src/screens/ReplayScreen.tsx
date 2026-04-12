interface Props { onRunSim: () => void; }

export default function ReplayScreen({ onRunSim }: Props) {
  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ fontSize: 10, color: 'rgba(232,230,248,0.3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 14 }}>Worst conditions · last 7 days</div>

      {/* AppLovin card */}
      <div style={{ background: 'rgba(248,113,113,0.06)', border: '0.5px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: 14, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#F87171' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>AppLovin · Friday 6–8pm</span>
          </div>
          <span style={{ fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '0.5px solid rgba(248,113,113,0.2)' }}>5.2% churn</span>
        </div>
        {[['Duration', 'avg 63s', '#F87171'], ['Load time', '4.1s avg', '#FBBF24'], ['Reward callback', '18% failed', '#F87171'], ['Resume time', '7.8s avg', '#F87171']].map(([k, v, c]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
            <span style={{ color: 'rgba(232,230,248,0.4)' }}>{k}</span>
            <span style={{ color: c }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button onClick={onRunSim} style={{ flex: 1, padding: 9, background: '#60A5FA', border: 'none', borderRadius: 7, color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>Run instantly</button>
          <button style={{ flex: 1, padding: 9, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 7, color: 'rgba(232,230,248,0.4)', fontSize: 10, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>Configure first</button>
        </div>
      </div>

      {/* ironSource card */}
      <div style={{ background: 'rgba(251,191,36,0.06)', border: '0.5px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: 14, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FBBF24' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>ironSource · load timeout</span>
          </div>
          <span style={{ fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '0.5px solid rgba(251,191,36,0.2)' }}>2.8% churn</span>
        </div>
        {[['Duration', 'avg 28s', 'rgba(232,230,248,0.55)'], ['Load timeout', '8.3% of serves', '#FBBF24'], ['Reward callback', '99% success', '#4ADE80'], ['Resume time', '3.1s avg', '#4ADE80']].map(([k, v, c]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
            <span style={{ color: 'rgba(232,230,248,0.4)' }}>{k}</span>
            <span style={{ color: c }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <button onClick={onRunSim} style={{ flex: 1, padding: 9, background: 'rgba(251,191,36,0.15)', border: '0.5px solid rgba(251,191,36,0.3)', borderRadius: 7, color: '#FBBF24', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>Run instantly</button>
          <button style={{ flex: 1, padding: 9, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 7, color: 'rgba(232,230,248,0.4)', fontSize: 10, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>Configure first</button>
        </div>
      </div>

      {/* Unity Ads — all good */}
      <div style={{ background: 'rgba(74,222,128,0.06)', border: '0.5px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80' }} />
          <span style={{ fontSize: 11, color: 'rgba(232,230,248,0.55)', lineHeight: 1.5 }}>Unity Ads — no high-churn scenarios this week</span>
        </div>
      </div>

      {/* Before vs After */}
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>Before vs after</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div style={{ background: 'rgba(248,113,113,0.07)', border: '0.5px solid rgba(248,113,113,0.2)', borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#F87171', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>Before</div>
          {[['Churn rate', '5.2%', 52], ['Resume time', '7.8s', 78], ['Completion', '81%', 81], ['Reward fail', '18%', 18]].map(([n, v, w]) => (
            <div key={n as string} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: 'rgba(232,230,248,0.3)', marginBottom: 2 }}>{n}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#F87171' }}>{v}</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 3 }}>
                <div style={{ height: 3, width: `${w}%`, background: '#F87171', borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(74,222,128,0.07)', border: '0.5px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#4ADE80', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>After</div>
          {[['Churn rate', '2.1%', 21], ['Resume time', '3.1s', 31], ['Completion', '96%', 96], ['Reward fail', '1.2%', 1]].map(([n, v, w]) => (
            <div key={n as string} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, color: 'rgba(232,230,248,0.3)', marginBottom: 2 }}>{n}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#4ADE80' }}>{v}</div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 3 }}>
                <div style={{ height: 3, width: `${w}%`, background: '#4ADE80', borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {[['−3.1%', 'churn delta'], ['−4.7s', 'resume saved'], ['+15%', 'completion lift'], ['−16.8%', 'reward failures']].map(([v, l]) => (
          <div key={l} style={{ background: 'rgba(74,222,128,0.07)', border: '0.5px solid rgba(74,222,128,0.15)', borderRadius: 8, padding: 9, textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#4ADE80' }}>{v}</div>
            <div style={{ fontSize: 8, color: 'rgba(74,222,128,0.5)', marginTop: 2, letterSpacing: '.04em' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}