import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
 
interface AdEvent {
  id: string;
  adNetwork: string;
  adFormat: string;
  eventType: string;
  durationMs: number;
  gameId: string;
  sessionId: string;
  timestamp: number;
  serverTimestamp: any;
}
 
interface Metrics {
  completion_rate: number;
  churn_rate: number;
  avg_resume_time_ms: number;
  total_breaks: number;
  network_counts: Record<string, number>;
  network_durations: Record<string, number[]>;
}
 
function computeMetrics(events: AdEvent[]): Metrics {
  const total = events.filter(e => e.eventType === 'started').length;
  const completed = events.filter(e => e.eventType === 'completed').length;
  const skipped = events.filter(e => e.eventType === 'skipped').length;
 
  const completion_rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const churn_rate = total > 0 ? parseFloat(((skipped / total) * 100).toFixed(1)) : 0;
 
  const resumeTimes = events.filter(e => e.eventType === 'completed' && e.durationMs > 0).map(e => e.durationMs);
  const avg_resume_time_ms = resumeTimes.length > 0
    ? Math.round(resumeTimes.reduce((a, b) => a + b, 0) / resumeTimes.length)
    : 0;
 
  const network_counts: Record<string, number> = {};
  const network_durations: Record<string, number[]> = {};
 
  events.filter(e => e.eventType === 'started').forEach(e => {
    const n = e.adNetwork || 'unknown';
    network_counts[n] = (network_counts[n] || 0) + 1;
  });
 
  events.filter(e => e.durationMs > 0).forEach(e => {
    const n = e.adNetwork || 'unknown';
    if (!network_durations[n]) network_durations[n] = [];
    network_durations[n].push(e.durationMs);
  });
 
  return {
    completion_rate,
    churn_rate,
    avg_resume_time_ms,
    total_breaks: total,
    network_counts,
    network_durations,
  };
}
 
export default function DashboardScreen() {
  const [events, setEvents] = useState<AdEvent[]>([]);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const q = query(
      collection(db, 'adEvents'),
      orderBy('timestamp', 'desc'),
      limit(200)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdEvent));
      setEvents(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
 
  const metrics = computeMetrics(events);
 
  const totalNetworkEvents = Object.values(metrics.network_counts).reduce((a, b) => a + b, 0) || 1;
 
  const NETWORK_COLORS: Record<string, string> = {
    admob: '#4ADE80',
    unity: '#60A5FA',
    ironsource: '#A78BFA',
    applovin: '#F87171',
    unknown: 'rgba(255,255,255,0.25)',
  };
 
  const networks = Object.entries(metrics.network_counts).map(([name, count]) => {
    const durations = metrics.network_durations[name] || [];
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 1000)
      : null;
    return {
      name,
      pct: Math.round((count / totalNetworkEvents) * 100),
      color: NETWORK_COLORS[name] || 'rgba(255,255,255,0.25)',
      flag: avgDuration && avgDuration > 45 ? `${avgDuration}s avg` : null,
    };
  }).sort((a, b) => b.pct - a.pct);
 
  const recentEvents = events.slice(0, 5);
 
  const fmt = (ms: number) => {
    if (ms === 0) return '—';
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };
 
  if (loading) {
    return (
      <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 10, color: 'rgba(232,230,248,0.4)' }}>Loading...</div>
        </div>
      </div>
    );
  }
 
  if (events.length === 0) {
    return (
      <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 11, color: 'rgba(232,230,248,0.4)', marginBottom: 4 }}>No events yet</div>
          <div style={{ fontSize: 9, color: 'rgba(232,230,248,0.2)' }}>Events will appear here once your SDK sends data</div>
        </div>
      </div>
    );
  }
 
  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
 
      {/* Session Health */}
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>Session health</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { val: `${metrics.completion_rate}%`, label: 'Completion rate', green: true, hero: false },
          { val: `${metrics.churn_rate}%`, label: 'Churn after ad', green: false, hero: false },
          { val: fmt(metrics.avg_resume_time_ms), label: 'Avg duration ★', green: true, hero: true },
          { val: `${metrics.total_breaks}`, label: 'Total breaks', green: false, hero: false },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.hero ? 'rgba(74,222,128,0.07)' : '#181828',
            border: `0.5px solid ${s.hero ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 8, padding: '10px 12px'
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: s.green ? '#4ADE80' : '#fff' }}>{s.val}</div>
            <div style={{ fontSize: 9, color: s.hero ? 'rgba(74,222,128,0.5)' : 'rgba(232,230,248,0.3)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
 
      {/* Network Breakdown */}
      {networks.length > 0 && (
        <>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>Network breakdown</div>
          <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            {networks.map((n, i) => (
              <div key={i} style={{ marginBottom: i < networks.length - 1 ? 10 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: n.flag ? '#F87171' : 'rgba(232,230,248,0.55)', textTransform: 'capitalize' }}>{n.name}</span>
                  <span style={{ fontSize: 10, color: n.color }}>{n.pct}%{n.flag ? ` · ${n.flag}` : ''}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 2 }}>
                  <div style={{ height: 3, width: `${n.pct}%`, background: n.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
 
      {/* Recent Events */}
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>Recent events</div>
      <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
        {recentEvents.map((e, i) => {
          const color = e.eventType === 'completed' ? '#4ADE80'
            : e.eventType === 'failed' ? '#F87171'
            : e.eventType === 'skipped' ? '#FBBF24'
            : '#60A5FA';
          return (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < recentEvents.length - 1 ? 8 : 0, paddingBottom: i < recentEvents.length - 1 ? 8 : 0, borderBottom: i < recentEvents.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 10, color: 'rgba(232,230,248,0.8)', textTransform: 'capitalize' }}>{e.eventType}</span>
                <span style={{ fontSize: 9, color: 'rgba(232,230,248,0.3)', marginLeft: 6, textTransform: 'capitalize' }}>{e.adNetwork} · {e.adFormat}</span>
              </div>
              <span style={{ fontSize: 8, color: 'rgba(232,230,248,0.25)' }}>
                {e.timestamp ? new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
          );
        })}
      </div>
 
      {/* Live indicator */}
      <div style={{ marginTop: 6, padding: '8px 12px', background: 'rgba(74,222,128,0.05)', border: '0.5px solid rgba(74,222,128,0.15)', borderRadius: 8, fontSize: 9, color: 'rgba(74,222,128,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80' }} />
        Live · {events.length} events · updates in real time from Firestore
      </div>
    </div>
  );
}
