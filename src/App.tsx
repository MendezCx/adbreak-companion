import { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import LiveScreen from './screens/LiveScreen';
import DashboardScreen from './screens/DashboardScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SimulationScreen from './screens/SimulationScreen';
import ReplayScreen from './screens/ReplayScreen';
import SettingsScreen from './screens/SettingsScreen';

type Screen = 'live' | 'dashboard' | 'analytics' | 'simulation' | 'replay' | 'settings';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>('live');
  const [simActive, setSimActive] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setUser(result.user);
        setLoading(false);
      }
    }).catch(console.error);

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (e: any) {
      if (e.code === 'auth/popup-blocked') {
        await signInWithRedirect(auth, googleProvider);
      }
      console.error(e);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0D0D1A',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: '#4ADE80', margin: '0 auto 16px'
          }} />
          <div style={{ fontSize: 12, color: 'rgba(232,230,248,0.4)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0D0D1A',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", color: '#E8E6F8'
      }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: '#4ADE80', margin: '0 auto 16px'
          }} />
          <h1 style={{
            fontSize: 32, fontWeight: 800,
            fontFamily: "'Syne', sans-serif",
            letterSpacing: '-0.03em', marginBottom: 8
          }}>AdBreak Companion</h1>
          <p style={{ color: 'rgba(232,230,248,0.5)', fontSize: 13 }}>
            Ad experience debugger for mobile game developers
          </p>
        </div>
        <button onClick={login} style={{
          background: '#4ADE80', color: '#052e16',
          border: 'none', borderRadius: 8,
          padding: '12px 32px', fontSize: 14,
          fontWeight: 700, cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace"
        }}>
          Sign in with Google
        </button>
      </div>
    );
  }

  const navItems: { id: Screen; label: string; icon: string }[] = [
    { id: 'live', label: 'Live', icon: '⬤' },
    { id: 'dashboard', label: 'Dashboard', icon: '▦' },
    { id: 'analytics', label: 'Analytics', icon: '↗' },
    { id: 'simulation', label: 'Sim', icon: '◈' },
    { id: 'replay', label: 'Replay', icon: '↺' },
    { id: 'settings', label: 'Settings', icon: '⚙' },
  ];

  const renderScreen = () => {
    switch (screen) {
      case 'live': return <LiveScreen simActive={simActive} setSimActive={setSimActive} />;
      case 'dashboard': return <DashboardScreen />;
      case 'analytics': return <AnalyticsScreen onRunSim={() => { setSimActive(true); setScreen('live'); }} />;
      case 'simulation': return <SimulationScreen onActivate={() => { setSimActive(true); setScreen('live'); }} />;
      case 'replay': return <ReplayScreen onRunSim={() => { setSimActive(true); setScreen('live'); }} />;
      case 'settings': return <SettingsScreen onLogout={logout} user={user} />;
      default: return <LiveScreen simActive={simActive} setSimActive={setSimActive} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D1A', fontFamily: "'JetBrains Mono', monospace", color: '#E8E6F8' }}>
      <header style={{
        background: 'rgba(13,13,26,0.95)',
        borderBottom: '0.5px solid rgba(255,255,255,0.07)',
        padding: '10px 20px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: simActive ? '#A78BFA' : '#4ADE80'
          }} />
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>
            AdBreak Companion
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {simActive && (
            <span style={{
              fontSize: 9, fontWeight: 600, padding: '3px 8px',
              borderRadius: 20, background: 'rgba(167,139,250,0.1)',
              color: '#A78BFA', border: '0.5px solid rgba(167,139,250,0.25)'
            }}>Sim active</span>
          )}
          <span style={{
            fontSize: 9, fontWeight: 600, padding: '3px 8px',
            borderRadius: 20, background: 'rgba(74,222,128,0.08)',
            color: '#4ADE80', border: '0.5px solid rgba(74,222,128,0.2)'
          }}>SDK active</span>
          <img
            src={user.photoURL || ''}
            alt="avatar"
            style={{ width: 28, height: 28, borderRadius: '50%', cursor: 'pointer' }}
            onClick={logout}
          />
        </div>
      </header>

      {simActive && (
        <div style={{
          background: 'rgba(167,139,250,0.1)',
          borderBottom: '0.5px solid rgba(167,139,250,0.25)',
          padding: '7px 20px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 11, color: '#A78BFA' }}>
            Simulating: AppLovin 60s · 3s load · 18% reward fail
          </span>
          <button onClick={() => setSimActive(false)} style={{
            background: 'rgba(167,139,250,0.2)',
            border: '0.5px solid rgba(167,139,250,0.3)',
            borderRadius: 5, color: '#A78BFA',
            fontSize: 9, fontWeight: 600,
            padding: '3px 10px', cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace"
          }}>Stop</button>
        </div>
      )}

      <main style={{ paddingBottom: 80 }}>
        {renderScreen()}
      </main>

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#0D0D1A',
        borderTop: '0.5px solid rgba(255,255,255,0.07)',
        display: 'flex', padding: '8px 0 16px'
      }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setScreen(item.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
            background: 'none', border: 'none', cursor: 'pointer',
            color: screen === item.id ? '#A78BFA' : 'rgba(232,230,248,0.25)',
            fontFamily: "'JetBrains Mono', monospace",
            transition: 'color 0.15s'
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ fontSize: 8, fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
