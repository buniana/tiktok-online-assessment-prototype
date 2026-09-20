import { useCallback, useEffect, useRef, useState } from 'react';
import './styles.css';
import CameraScreen from './screens/CameraScreen.jsx';
import PlanFlow from './screens/PlanFlow.jsx';
import FilmFlow from './screens/FilmFlow.jsx';
import DebugPanel from './components/DebugPanel.jsx';
import { useMic } from './hooks/useMic.js';
import { SCRIPT, PLANS } from './script.js';

const W = 440;
const H = 956;
const params = new URLSearchParams(window.location.search);
// Dev tools (debug panel, its button, the D and S keys) are available while developing, and off in the production build that
// gets shared as a link, unless the link says ?debug=1. (?debug=0 only starts the panel closed.) They never show on phones.
const DEBUG_OK = params.get('debug') === '1' || !import.meta.env.PROD;
const WIDE = window.innerWidth >= 900;
const START_PARAMS = ['jump', 'open', 'ver', 'fseg', 'fphase', 'fp']; // URL shortcuts that choose the screen to start on (used by the test scripts)
if (params.get('fit') === '0') document.documentElement.classList.add('pixel-mode');

function useFit(reserveRight) {
  const compute = useCallback(() => {
    if (params.get('fit') === '0') return 1;
    const margin = window.innerWidth < 600 ? 0 : 40; // phones: fill the screen edge to edge
    const availW = window.innerWidth - reserveRight - margin;
    const availH = window.innerHeight - margin;
    return Math.min(availW / W, availH / H, 1);
  }, [reserveRight]);
  const [scale, setScale] = useState(compute);
  useEffect(() => {
    const on = () => setScale(compute());
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [compute]);
  return scale;
}

export default function App() {
  const [screen, setScreen] = useState('camera'); // camera | plan | film (the plan stays mounted underneath the filming screen)
  const [filmPlan, setFilmPlan] = useState(PLANS[0]);
  const [filmKey, setFilmKey] = useState(0);
  const [filmInit, setFilmInit] = useState(null);
  const [flowKey, setFlowKey] = useState(0);
  const [closing, setClosing] = useState(false); // the chat is sliding away: the camera screen comes back at the same time
  const [phase, setPhase] = useState(null);
  const [debugOpen, setDebugOpen] = useState(DEBUG_OK && WIDE && params.get('debug') !== '0');
  const [lines, setLines] = useState(SCRIPT.userTurns);
  const [tts, setTts] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [kbTheme, setKbTheme] = useState('dark');
  const [waveStyle, setWaveStyle] = useState('solid');
  // Simulated sound input: on by default. ?sim=0 / ?sim=1 override it; the last choice made in the panel (or with S) is remembered.
  const [simInput, setSimInput] = useState(() => {
    const q = params.get('sim');
    if (q === '0') return false;
    if (q === '1') return true;
    try {
      const v = localStorage.getItem('sim-input');
      if (v !== null) return v === '1';
    } catch {
      /* storage unavailable: use the default */
    }
    return true;
  });
  const simRef = useRef(simInput);
  simRef.current = simInput;
  const [toast, setToast] = useState('');
  const toastTimer = useRef(0);
  const setSim = useCallback((on) => {
    setSimInput(on);
    try {
      localStorage.setItem('sim-input', on ? '1' : '0');
    } catch {
      /* ignore */
    }
    setToast(on ? 'Simulated sound input: on' : 'Simulated sound input: off');
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1500);
  }, []);
  const mic = useMic();
  const controlsRef = useRef({});
  // dev hook used by the pixel-comparison harness
  window.__proto = { simulate: (ms) => mic.simulate(ms), jump: (id) => controlsRef.current.jumpTo?.(id) };
  const scale = useFit(debugOpen ? 330 : 0);

  const openFlow = useCallback((jump) => {
    setClosing(false);
    setFlowKey((k) => k + 1);
    setScreen('plan');
    if (typeof jump === 'string') setTimeout(() => controlsRef.current.jumpTo?.(jump), 90);
  }, []);

  const restart = useCallback(() => {
    window.speechSynthesis?.cancel();
    setClosing(false);
    setScreen('camera');
    setPhase(null);
    setFlowKey((k) => k + 1);
  }, []);

  const openFilm = useCallback((plan, init = null) => {
    setFilmPlan(plan);
    setFilmInit(init);
    setFilmKey((k) => k + 1);
    setScreen('film');
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!DEBUG_OK || /input|textarea/i.test(e.target.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'd' || e.key === 'D') setDebugOpen((v) => !v);
      if (e.key === 's' || e.key === 'S') setSim(!simRef.current);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSim]);

  useEffect(() => {
    // The start-screen shortcuts are used once, then taken off the address bar, so refreshing the page starts the flow from the beginning.
    const url = new URL(window.location.href);
    if (START_PARAMS.some((k) => url.searchParams.has(k))) {
      START_PARAMS.forEach((k) => url.searchParams.delete(k));
      window.history.replaceState(null, '', url);
    }
    const jump = params.get('jump');
    if (jump === 'camera') return;
    if (jump === 'film') {
      // ?jump=film&ver=1&fseg=2&fphase=review
      openFlow('plan');
      openFilm(PLANS[+params.get('ver') || 0] || PLANS[0], {
        seg: +params.get('fseg') || 0,
        phase: params.get('fphase') || 'ready',
        p: params.get('fp') != null ? +params.get('fp') : null,
      });
      return;
    }
    if (jump) openFlow(jump);
    else if (params.get('open') === '1') openFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page" style={{ paddingRight: debugOpen ? 330 : 0 }}>
      <div className="stage-wrap" style={{ width: W * scale, height: H * scale }}>
        <div className="device" style={{ transform: `scale(${scale})` }}>
          <CameraScreen onPlan={() => openFlow()} receding={screen !== 'camera' && !closing} showHint={showHint && screen === 'camera'} />

          {(screen === 'plan' || screen === 'film') && (
            <PlanFlow
              key={flowKey}
              mic={mic}
              lines={lines}
              tts={tts}
              kbTheme={kbTheme}
              waveStyle={waveStyle}
              simInput={simInput}
              controlsRef={controlsRef}
              onPhase={setPhase}
              onBack={restart}
              onLeaving={() => setClosing(true)}
              onReadyToFilm={(plan) => openFilm(plan)}
            />
          )}

          {screen === 'film' && (
            <FilmFlow
              key={`film-${filmKey}`}
              shots={filmPlan.shots}
              initial={filmInit}
              controlsRef={controlsRef}
              onExit={() => setScreen('plan')}
              onRestart={restart}
            />
          )}
        </div>
      </div>

      {DEBUG_OK && WIDE && <button className="debug-toggle" onClick={() => setDebugOpen((v) => !v)}>{debugOpen ? 'Hide debug' : 'Debug'}</button>}
      {debugOpen && (
        <DebugPanel
          mic={mic}
          phase={phase}
          screen={screen}
          lines={lines}
          setLines={setLines}
          tts={tts}
          setTts={setTts}
          controlsRef={controlsRef}
          onRestart={restart}
          onOpenFlow={openFlow}
          onOpenFilm={(ver) => openFilm(PLANS[ver])}
          showHint={showHint}
          setShowHint={setShowHint}
          kbTheme={kbTheme}
          setKbTheme={setKbTheme}
          waveStyle={waveStyle}
          setWaveStyle={setWaveStyle}
          simInput={simInput}
          setSim={setSim}
        />
      )}
      {toast && <div className="sim-toast">{toast}</div>}
    </div>
  );
}
