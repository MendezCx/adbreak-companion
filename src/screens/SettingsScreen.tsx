import type { User } from 'firebase/auth';
interface Props { onLogout: () => void; user: User; }

export default function SettingsScreen({ onLogout, user }: Props) {
  const sec = (title: string) => (
    <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(232,230,248,0.3)', marginBottom: 8, marginTop: 20 }}>{title}</div>
  );

  const row = (label: string, right: React.ReactNode) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 12, color: 'rgba(232,230,248,0.85)' }}>{label}</span>
      {right}
    </div>
  );

  const pill = (text: string, color: string, bg: string) => (
    <span style={{ fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: bg, color, border: `0.5px solid ${color}40` }}>{text}</span>
  );

  return (
    <div style={{ padding: 16, maxWidth: 480, margin: '0 auto' }}>
      <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '12px 14px', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={user.photoURL || ''} style={{ width: 36, height: 36, borderRadius: '50%' }} alt="avatar" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{user.displayName}</div>
            <div style={{ fontSize: 10, color: 'rgba(232,230,248,0.4)' }}>{user.email}</div>
          </div>
        </div>
      </div>

      {sec('Break experience')}
      <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0 14px' }}>
        {[['Auto-mute on break', true], ['Timer overlay', true], ['Resume assist', false]].map(([label, on]) => (
          <div key={label as string} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 12, color: 'rgba(232,230,248,0.85)' }}>{label as string}</span>
            <div style={{ width: 34, height: 19, borderRadius: 10, background: on ? '#4ADE80' : 'rgba(255,255,255,0.12)', position: 'relative' }}>
              <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: on ? 17 : 2, transition: 'left 0.2s' }} />
            </div>
          </div>
        ))}
      </div>

      {sec('Thresholds & alerts')}
      <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0 14px' }}>
        {row('Max break length', <span style={{ fontSize: 12, color: '#FBBF24', fontWeight: 500 }}>45s</span>)}
        {row('Churn rate alert', <span style={{ fontSize: 12, color: '#FBBF24', fontWeight: 500 }}>3.0%</span>)}
        {row('Resume time alert', <span style={{ fontSize: 12, color: '#FBBF24', fontWeight: 500 }}>6.0s</span>)}
      </div>

      {sec('SDK integrations')}
      <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0 14px' }}>
        {row('Unity Ads', pill('Connected', '#4ADE80', 'rgba(74,222,128,0.1)'))}
        {row('ironSource', pill('Connected', '#4ADE80', 'rgba(74,222,128,0.1)'))}
        {row('AppLovin', pill('Partial', '#FBBF24', 'rgba(251,191,36,0.1)'))}
        {row('AdMob', pill('Connected', '#4ADE80', 'rgba(74,222,128,0.1)'))}
      </div>

      {sec('Saved scenarios')}
      <div style={{ background: '#181828', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0 14px' }}>
        {[['AppLovin 60s churn test', '#A78BFA', 'rgba(167,139,250,0.1)'], ['ironSource timeout flow', '#FBBF24', 'rgba(251,191,36,0.1)']].map(([name, color, bg]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 11, color: 'rgba(232,230,248,0.55)', flex: 1 }}>{name}</span>
            {pill('Saved', color as string, bg as string)}
          </div>
        ))}
      </div>

      <button onClick={onLogout} style={{
        width: '100%', marginTop: 24, padding: 12,
        background: 'rgba(248,113,113,0.08)',
        border: '0.5px solid rgba(248,113,113,0.2)',
        borderRadius: 12, color: '#F87171',
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
        fontFamily: "'JetBrains Mono', monospace"
      }}>Sign out</button>
    </div>
  );
}