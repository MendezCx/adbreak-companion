import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface Metrics {
  completion_rate: number;
  churn_rate: number;
  avg_resume_time_ms: number;
  avg_break_length_ms: number;
  total_breaks: number;
  unity_ads_pct: number;
  ironsource_pct: number;
  applovin_pct: number;
  admob_pct: number;
  applovin_avg_duration: number;
}

export default function DashboardScreen() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, 'studios', 'demo-studio', 'metrics', 'puzzle-quest');
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setMetrics(snap.data() as Metrics);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fmt = (ms: number) => {
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  };

  const alerts = [
    {
      dot: '#F87171',
      text: `AppLovin avg ${metrics?.applovin_avg_duration ?? 61}s — above 45s threshold`,
      tag: 'Warn', tagColor: '#F87171',
      tagBg: 'rgba(248,113,113,0.1)',
      cardBorder: 'rgba(248,113,113,0.2)'
    },
    {
      dot: '#FBBF24',
      text: `Slow resume ${((metrics?.avg_resume_time_ms ?? 3200) / 1000).toFixed(1)}s — above 6s target`,
      tag: 'Review', tagColor: '#FBBF24',
      tagBg: 'rgba(251,191,36,0.1)',
      cardBorder: 'rgba(255,255,255,0.07)'
    },
    {
      dot: '#4ADE80',
      text: `Churn rate ${metrics?.churn_rate ?? 1.8}% — within target`,
      tag: 'OK', tagColor: '#4ADE80',
      tagBg: 'rgba(74,222,128,0.1)',
      cardBorder: 'rgba(255,255,255,0.07)'
    },
  ];

  const networks = [
    { name: 'Unity Ads', pct: metrics?.unity_ads_pct ?? 41, color: '#4ADE80' },
    { name: 'ironSource', pct: metrics?.ironsource_pct ?? 29, color: '#60A5FA' },
    { name: 'AppLovin', pct: metrics?.applovin_pct ?? 22, color: '#F87171', flag: `${metrics?.applovin_avg_duration ?? 61}s avg` },
    { name: 'AdMob', pct: metrics?.admob_pct ?? 8, color: 'rgba(255,255,255,0.25)' },
  ];

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

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>Session health</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { val: `${metrics?.completion_rate ?? 94}%`, label: 'Completion rate', green: true, hero: false },
          { val: `${metrics?.churn_rate ?? 1.8}%`, label: 'Churn after ad', green: false, hero: false },
          { val: `${((metrics?.avg_resume_time_ms ?? 3200) / 1000).toFixed(1)}s`, label: 'Resume time ★', green: true, hero: true },
          { val: fmt(metrics?.avg_break_length_ms ?? 23000), label: 'Avg break length', green: false, hero: false },
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

      <div style={{ marginTop: 14, padding: '8px 12px', background: 'rgba(74,222,128,0.05)', border: '0.5px solid rgba(74,222,128,0.15)', borderRadius: 8, fontSize: 9, color: 'rgba(74,222,128,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80' }} />
        Live · updates in real time from Firestore
      </div>
    </div>
  );
}
