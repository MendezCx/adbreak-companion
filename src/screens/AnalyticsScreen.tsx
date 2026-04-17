import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

interface AdEvent {
  id: string;
  adNetwork: string;
  adFormat: string;
  eventType: string;
  durationMs: number;
  timestamp: number;
}

interface DayStats {
  day: string;
  completions: number;
  churn: number;
}

interface Props {
  onRunSim: () => void;
}

export default function AnalyticsScreen({ onRunSim }: Props) {
  const [events, setEvents] = useState<AdEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'adEvents'),
      orderBy('timestamp', 'desc'),
      limit(500)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdEvent));
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const dayStats: DayStats[] = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets: Record<string, { completions: number; churn: number }> = {};
    days.forEach(d => { buckets[d] = { completions: 0, churn: 0 }; });
    events.forEach(e => {
      const day = days[new Date(e.timestamp).getDay()];
      if (e.eventType === 'completed') buckets[day].completions++;
      if (e.eventType === 'skipped') buckets[day].churn++;
    });
    const today = new Date().getDay();
    return Array.from({ length: 7 }, (_, i) => {
      const idx = (today - 6 + i + 7) % 7;
      return { day: days[idx], ...buckets[days[idx]] };
    });
  })();

  const durationBuckets = (() => {
    const withDuration = events.filter(e => e.durationMs > 0);
    const total = withDuration.length || 1;
    return [
      { label: '0–15s', pct: Math.round((withDuration.filter(e => e.durationMs < 15000).length / total) * 100), color: '#4ADE80' },
      { label: '15–30s', pct: Math.round((withDuration.filter(e => e.durationMs >= 15000 && e.durationMs < 30000).length / total) * 100), color: '#4ADE80' },
      { label: '30–60s', pct: Math.round((withDuration.filter(e => e.durationMs >= 30000 && e.durationMs < 60000).length / total) * 100), color: '#FBBF24' },
      { label: '60s+', pct: Math.round((withDuration.filter(e => e.durationMs >= 60000).length / total) * 100), color: '#F87171' },
    ];
  })();

  const highChurnNetwork = (() => {
    const networks: Record<string, { started: number; skipped: number }> = {};
    events.forEach(e => {
      const n = e.adNetwork || 'unknown';
      if (!networks[n]) networks[n] = { started: 0, skipped: 0 };
      if (e.eventType === 'started') networks[n].started++;
      if (e.eventType === 'skipped') networks[n].skipped++;
    });
    let worst = '';
    let worstRate = 0;
    Object.entries(networks).forEach(([n, s]) => {
      const rate = s.started > 0 ? s.skipped / s.started : 0;
      if (rate > worstRate) { worstRate = rate; worst = n; }
    });
    return worst && worstRate > 0 ? { name: worst, rate: Math.round(worstRate * 100) } : null;
  })();

  const longAdPct = durationBuckets[3].pct;
  const maxVal = Math.max(...dayStats.map(d => Math.max(d.completions, d.churn)), 1);
  const scaleY = (val: number) => 70 - (val / maxVal) * 55;
  const chartPoints = (key: 'completions' | 'churn') =>
    dayStats.map((d, i) => `${(i / 6) * 320},${scaleY(d[key])}`).join(' ');

  if (loading) return (
    <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', margin: '0 auto 8px' }} />
        <div style={{ fontSize: 10, color: 'rgba(232,230,248,0.4)' }}>Loading...</div>
      </div>
    </div>
  );

  if (events.length === 0) return (
    <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>📊</div>
        <div style={{ fontSize: 11, color: 'rgba(232,230,248,0.4)', marginBottom: 4 }}>No data yet</div>
        <div style={{ fontSize: 9, color: 'rgba(232,230,248,0.2)' }}>Analytics will appear once your SDK sends events</div>
      </div>
    </div>
  );

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>

      {highChurnNetwork && (
        <div style={{ background: 'rgba(96,165,250,0.07)', border: '0.5px solid rgba(96,165,250,0.2)', borderRadius: 12, padding: 13, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#A78BFA' }} />
            <span style={{ fontSize: 9, fontWeight: 600, color: '#A78BFA', letterSpacing: '.04em' }}>Auto-suggest</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(232,230,248,0.55)', lineHeight: 1.5, marginBottom: 10 }}>
            High churn detected from <span style={{ color: '#fff', textTransform: 'capitalize' }}>{highChurnNetwork.name}</span> ({highChurnNetwork.rate}% skip rate). Want to simulate this condition now?
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={onRunSim} style={{ flex: 1, padding: 8, background: '#60A5FA', border: 'none', borderRadius: 7, color: '#fff', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>Run simulation</button>
            <button style={{ flex: 1, padding: 8, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 7, color: 'rgba(232,230,248,0.55)', fontSize: 10, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>Dismiss</button>
          </div>
        </div>
      )}

      <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 10 }}>Completions vs churn · 7 days</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(232,230,248,0.55)' }}>
            <div style={{ width: 14, height: 2, background: '#4ADE80', borderRadius: 1 }} />
            <span>Completions</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 9, color: 'rgba(232,230,248,0.55)' }}>
            <div style={{ width: 14, height: 2, background: '#F87171', borderRadius: 1 }} />
            <span>Post-break churn</span>
          </div>
        </div>
        <svg width="100%" viewBox="0 0 320 90" style={{ display: 'block' }}>
          <line x1="0" y1="70" x2="320" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1="0" y1="45" x2="320" y2="45" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          <polyline points={chartPoints('completions')} fill="none" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={chartPoints('churn')} fill="none" stroke="#F87171" strokeWidth="1.5" strokeDasharray="3,2" strokeLinecap="round" strokeLinejoin="round" />
          {dayStats.map((d, i) => (
            <text key={d.day} x={(i / 6) * 300 + 10} y="84" fill="rgba(232,230,248,0.25)" fontSize="7" fontFamily="'JetBrains Mono', monospace">{d.day}</text>
          ))}
        </svg>
      </div>

      <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: '.06em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 10 }}>Ad length distribution</div>
        {durationBuckets.map((b, i) => (
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

      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>Recommendations</div>

      {longAdPct > 5 && (
        <div style={{ background: 'rgba(251,191,36,0.06)', border: '0.5px solid rgba(251,191,36,0.2)', borderRadius: 12, padding: '10px 12px', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 7, marginBottom: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FBBF24', marginTop: 3, flexShrink: 0 }} />
            <div style={{ fontSize: 11, color: 'rgba(232,230,248,0.55)', lineHeight: 1.5 }}>{longAdPct}% of ads are 60s+ — consider capping max ad duration to reduce churn</div>
          </div>
          <button onClick={onRunSim} style={{ width: '100%', padding: 7, background: 'rgba(96,165,250,0.15)', border: '0.5px solid rgba(96,165,250,0.3)', borderRadius: 7, color: '#60A5FA', fontSize: 9, fontWeight: 600, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace" }}>Run simulation</button>
        </div>
      )}

      {!highChurnNetwork && longAdPct <= 5 && (
        <div style={{ background: 'rgba(74,222,128,0.06)', border: '0.5px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: '10px 12px' }}>
          <div style={{ display: 'flex', gap: 7 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', marginTop: 3, flexShrink: 0 }} />
            <div style={{ fontSize: 11, color: 'rgba(232,230,248,0.55)', lineHeight: 1.5 }}>No major issues detected — ad experience looks healthy!</div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(74,222,128,0.05)', border: '0.5px solid rgba(74,222,128,0.15)', borderRadius: 8, fontSize: 9, color: 'rgba(74,222,128,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80' }} />
        Live · {events.length} events · updates in real time from Firestore
      </div>
    </div>
  );
}
