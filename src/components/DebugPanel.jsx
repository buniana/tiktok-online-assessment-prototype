import { useEffect, useState } from 'react';

const PHASES = [
  ['listen1', 'Listening #1'],
  ['ask1', 'AI question'],
  ['listen2', 'Listening #2'],
  ['done', 'Got it'],
  ['think', 'Thinking'],
  ['plan', 'Plan'],
];

const FILM_STATES = [
  [0, 'ready', 'Seg 1 ready'],
  [0, 'recording', 'Seg 1 recording'],
  [0, 'review', 'Seg 1 review'],
  [-1, 'review', 'Last review'],
  [-1, 'preview', 'Full preview'],
];

export default function DebugPanel({ mic, phase, screen, lines, setLines, tts, setTts, controlsRef, onRestart, onOpenFlow, onOpenFilm, showHint, setShowHint, kbTheme, setKbTheme, waveStyle, setWaveStyle, simInput, setSim }) {
  const [level, setLevel] = useState(0);
  useEffect(() => {
    let raf;
    const tick = () => {
      setLevel(mic.levelRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mic.levelRef]);

  const c = () => controlsRef.current || {};

  return (
    <aside className="debug">
      <h3>Flow</h3>
      <div className="row" style={{ marginBottom: 6 }}>
        <span className="pill">screen: {screen}</span>
        <span className="pill">phase: {phase || '-'}</span>
      </div>
      <div className="row">
        <button onClick={onRestart}>Restart</button>
        <button onClick={onOpenFlow}>Open planning</button>
      </div>
      <label>Jump to state</label>
      <div className="row">
        {PHASES.map(([id, name]) => (
          <button key={id} onClick={() => (screen === 'plan' ? c().jumpTo?.(id) : onOpenFlow(id))}>{name}</button>
        ))}
      </div>

      <label>Filming</label>
      <div className="row">
        <button onClick={() => onOpenFilm(0)}>Film: 3 shots</button>
        <button onClick={() => onOpenFilm(1)}>Film: updated plan (4)</button>
      </div>
      {screen === 'film' && (
        <div className="row">
          {FILM_STATES.map(([s, p, name]) => (
            <button key={name} onClick={() => c().film?.go(s, p)}>{name}</button>
          ))}
        </div>
      )}

      <h3>Microphone</h3>
      <div className="row"><span className="pill">{mic.status}</span></div>
      <div className="meter"><i style={{ width: `${Math.round(level * 100)}%` }} /></div>
      <label className="check"><input type="checkbox" checked={!!simInput} onChange={(e) => setSim(e.target.checked)} /> Simulated sound input (on by default)</label>
      <p className="muted" style={{ margin: '4px 0 8px' }}>
        On: each time the app starts listening it “speaks” the line below by itself, then goes quiet so the turn ends on its own, and the real microphone is never asked for. Off: the real microphone is used (the browser asks for permission). Press <b>S</b> to switch it.
      </p>
      <div className="row">
        <button onClick={() => mic.start()}>Enable mic</button>
        <button onClick={() => c().simulateSpeech?.()}>Simulate speech</button>
        <button onClick={() => c().sendNow?.()}>Send now</button>
      </div>
      <p className="muted" style={{ margin: '8px 0 0' }}>
        “Enable mic” turns the real mic on by hand (it then mixes in). Tapping the wave (or “Send now”) always submits the line below.
      </p>

      <h3>What the user “says”</h3>
      <label>Turn 1 (auto-listening)</label>
      <textarea value={lines[0]} onChange={(e) => setLines([e.target.value, lines[1]])} />
      <label>Turn 2 (tap to speak)</label>
      <textarea value={lines[1]} onChange={(e) => setLines([lines[0], e.target.value])} />

      <h3>Options</h3>
      <label className="check"><input type="checkbox" checked={tts} onChange={(e) => setTts(e.target.checked)} /> AI speaks its lines aloud</label>
      <label className="check"><input type="checkbox" checked={showHint} onChange={(e) => setShowHint(e.target.checked)} /> Show tap hint on PLAN</label>
      <label>Wave style</label>
      <div className="row">
        <button onClick={() => setWaveStyle('solid')} style={{ outline: waveStyle === 'solid' ? '1px solid #888' : 'none' }}>Solid</button>
        <button onClick={() => setWaveStyle('glow')} style={{ outline: waveStyle === 'glow' ? '1px solid #888' : 'none' }}>Glow</button>
      </div>
      <label>Keyboard</label>
      <div className="row">
        <button onClick={() => setKbTheme('dark')} style={{ outline: kbTheme === 'dark' ? '1px solid #888' : 'none' }}>Dark</button>
        <button onClick={() => setKbTheme('light')} style={{ outline: kbTheme === 'light' ? '1px solid #888' : 'none' }}>Light</button>
      </div>
      <p className="muted">Press <b>D</b> to show/hide this panel, <b>S</b> to switch simulated sound.</p>
    </aside>
  );
}
