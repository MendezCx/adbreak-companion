import { useState, useEffect } from 'react';

interface Props {
  simActive: boolean;
  setSimActive: (v: boolean) => void;
}

export default function LiveScreen({ simActive, setSimActive }: Props) {
  const [timerVal, setTimerVal] = useState(simActive ? 0 : 8);
  const [toggles, setToggles] = useState({
    autoMute: true,
    timerOverlay: true,
    resumeAssist: false
  });

  useEffect(() => {
    if (!simActive) { setTimerVal(8); return; }
    setTimerVal(0);
    const interval = setInterval(() => {
      setTimerVal(prev => {
        if (prev >= 60) { clearInterval(interval); return 60; }
        return prev + 1;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [simActive]);

  const maxTime = simActive ? 60 : 30;
  const circumference = 2 * Math.PI * 52;
  const progress = timerVal / maxTime;
  const offset = circumference * (1 - progress);
  const ringColor = simActive ? '#A78BFA' : '#4ADE80';

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ padding: '16px', maxWidth: 480, margin: '0 auto' }}>

      {/* Ring */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0 12px' }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="52" fill="none"
            stroke={simActive ? 'rgba(167,139,250,0.12)' : 'rgba(74,222,128,0.12)'}
            strokeWidth="7" />
          <circle cx="65" cy="65" r="52" fill="none"
            stroke={ringColor} strokeWidth="7"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 65 65)"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
          <text x="65" y="61" textAnchor="middle" fill="white"
            fontSize="22" fontWeight="600"
            fontFamily="'JetBrains Mono', monospace">
            {timerVal}s
          </text>
          <text x="65" y="78" textAnchor="middle"
            fill="rgba(232,230,248,0.35)" fontSize="10"
            fontFamily="'JetBrains Mono', monospace">
            of {maxTime}s
          </text>
        </svg>

        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <span style={{
            fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
            background: simActive ? 'rgba(167,139,250,0.1)' : 'rgba(96,165,250,0.08)',
            color: simActive ? '#A78BFA' : '#60A5FA',
            border: `0.5px solid ${simActive ? 'rgba(167,139,250,0.25)' : 'rgba(96,165,250,0.2)'}`
          }}>Rewarded video</span>
          <span style={{
            fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
            background: simActive ? 'rgba(167,139,250,0.1)' : 'rgba(74,222,128,0.08)',
            color: simActive ? '#A78BFA' : '#4ADE80',
            border: `0.5px solid ${simActive ? 'rgba(167,139,250,0.25)' : 'rgba(74,222,128,0.2)'}`
          }}>SDK active</span>
        </div>

        {/* Phase strip */}
        <div style={{ display: 'flex', gap: 3, width: '100%', marginTop: 12 }}>
          {['#60A5FA', simActive ? '#A78BFA' : '#4ADE80', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)'].map((c, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: c }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 4 }}>
          <span style={{ fontSize: 9, color: 'rgba(232,230,248,0.3)' }}>Loading → Playing</span>
          <span style={{ fontSize: 9, color: 'rgba(232,230,248,0.3)' }}>Reward pending</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>
          Break controls
        </div>
        <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '4px 14px' }}>
          {[
            { key: 'autoMute' as const, label: 'Auto-mute', sub: 'Silence audio during break' },
            { key: 'timerOverlay' as const, label: 'Timer overlay', sub: 'Show countdown on screen' },
            { key: 'resumeAssist' as const, label: 'Resume assist', sub: 'Prompt player on ad end' },
          ].map(item => (
            <div key={item.key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)'
            }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(232,230,248,0.85)' }}>{item.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(232,230,248,0.4)', marginTop: 2 }}>{item.sub}</div>
              </div>
              <button onClick={() => toggle(item.key)} style={{
                width: 34, height: 19, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: toggles[item.key] ? '#4ADE80' : 'rgba(255,255,255,0.12)',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0
              }}>
                <div style={{
                  width: 15, height: 15, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 2,
                  left: toggles[item.key] ? 17 : 2,
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8 }}>
        Session stats
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { val: '12', label: 'Breaks today', green: false },
          { val: '4m 40s', label: 'Total wait', green: false },
          { val: '3.2s', label: 'Resume time ★', green: true, hero: true },
          { val: '23s', label: 'Avg length', green: false },
        ].map((s, i) => (
          <div key={i} style={{
            background: s.hero ? 'rgba(74,222,128,0.07)' : '#181828',
            border: `0.5px solid ${s.hero ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 8, padding: '10px 12px'
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: s.green ? '#4ADE80' : '#fff' }}>
              {s.val}
            </div>
            <div style={{ fontSize: 9, color: s.hero ? 'rgba(74,222,128,0.5)' : 'rgba(232,230,248,0.3)', marginTop: 3 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Run sim button */}
      {!simActive && (
        <div style={{ marginTop: 14 }}>
          <button onClick={() => setSimActive(true)} style={{
            width: '100%', padding: 11,
            background: 'rgba(167,139,250,0.1)',
            border: '0.5px solid rgba(167,139,250,0.25)',
            borderRadius: 12, color: '#A78BFA',
            fontSize: 11, fontWeight: 600,
            cursor: 'pointer', letterSpacing: '.04em',
            fontFamily: "'JetBrains Mono', monospace"
          }}>Run simulation →</button>
        </div>
      )}
    </div>
  );
}