import { useState } from 'react';
interface Props { onActivate: () => void; }

export default function SimulationScreen({ onActivate }: Props) {
  const [preset, setPreset] = useState('Worst case');
  const [availability, setAvailability] = useState('Normal');
  const [load, setLoad] = useState('3s delay');
  const [playback, setPlayback] = useState('Normal');
  const [reward, setReward] = useState('Success');
  const [duration, setDuration] = useState('60s');

  const seg = (options: string[], val: string, set: (v: string) => void, warnOpts: string[] = []) => (
    <div style={{ display: 'flex', gap: 3 }}>
      {options.map(o => {
        const isOn = val === o;
        const isWarn = warnOpts.includes(o);
        return (
          <button key={o} onClick={() => set(o)} style={{
            flex: 1, padding: '7px 4px', borderRadius: 6,
            fontSize: 9, fontWeight: 600, textAlign: 'center', cursor: 'pointer',
            border: 'none', fontFamily: "'JetBrains Mono', monospace",
            background: isOn ? (isWarn ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.15)') : 'rgba(255,255,255,0.05)',
            color: isOn ? (isWarn ? '#F87171' : '#4ADE80') : 'rgba(232,230,248,0.3)',
          }}>{o}</button>
        );
      })}
    </div>
  );

  const label = (text: string) => (
    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 6, marginTop: 12 }}>{text}</div>
  );

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 10, color: 'rgba(232,230,248,0.3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Test mode · dev build only</div>
        <span style={{ fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: '0.5px solid rgba(167,139,250,0.25)' }}>Dev</span>
      </div>

      {label('Quick presets')}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {['Worst case', 'High churn', 'Slow network', 'Reward fail'].map(p => (
          <button key={p} onClick={() => setPreset(p)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 10, fontWeight: 600,
            cursor: 'pointer', border: 'none', fontFamily: "'JetBrains Mono', monospace",
            background: preset === p ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.05)',
            color: preset === p ? '#A78BFA' : 'rgba(232,230,248,0.4)',
          }}>{p}</button>
        ))}
      </div>

      <div style={{ background: 'rgba(167,139,250,0.07)', border: '0.5px solid rgba(167,139,250,0.2)', borderRadius: 8, padding: '9px 12px', marginBottom: 4, fontSize: 10, color: 'rgba(167,139,250,0.8)', lineHeight: 1.5 }}>
        Worst case: 60s · slow load · fail request · reward fail
      </div>

      {label('Ad availability')}
      {seg(['Normal', 'No fill', 'Fail request'], availability, setAvailability, ['Fail request'])}

      {label('Load behavior')}
      {seg(['Instant', '3s delay', '5s delay', 'Timeout'], load, setLoad, ['Timeout'])}

      {label('Playback behavior')}
      {seg(['Normal', 'Early exit', 'Error'], playback, setPlayback, ['Error'])}

      {label('Reward callback')}
      {seg(['Success', 'Delayed 2s', 'Fail', 'Missing'], reward, setReward, ['Fail', 'Missing'])}

      {label('Duration override')}
      {seg(['Off', '3s', '10s', '30s', '60s'], duration, setDuration, ['60s'])}

      <div style={{ background: 'rgba(74,222,128,0.06)', borderLeft: '3px solid #4ADE80', borderRadius: '0 8px 8px 0', padding: '9px 12px', fontSize: 10, color: 'rgba(74,222,128,0.8)', lineHeight: 1.5, marginTop: 12, marginBottom: 14 }}>
        Active: {duration} mock · {load} · {reward.toLowerCase()} · dev builds only
      </div>

      <button onClick={onActivate} style={{
        width: '100%', padding: 12, background: 'rgba(167,139,250,0.1)',
        border: '0.5px solid rgba(167,139,250,0.25)', borderRadius: 12,
        color: '#A78BFA', fontSize: 11, fontWeight: 600, cursor: 'pointer',
        letterSpacing: '.04em', fontFamily: "'JetBrains Mono', monospace"
      }}>Activate simulation →</button>
    </div>
  );
}