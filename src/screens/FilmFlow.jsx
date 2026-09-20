import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StatusBar from '../components/StatusBar.jsx';
import { FlipIcon, FlashIcon, EffectsIcon, TimerIcon, LayoutIcon, BeautyIcon } from '../components/CamTools.jsx';
import PreviewIcons, { Avatar } from '../components/PreviewIcons.jsx';

// One stock clip behind each shot (Pexels licence, see design.md). The 4th shot of the updated plan
// reuses the sunset clip until a real one is uploaded.
export const CLIPS = ['/video/segment-1.mp4', '/video/segment-2.mp4', '/video/segment-3.mp4', '/video/segment-3.mp4'];

// The record button's ring and disc morph between "ready" and "recording" with this small tween instead of CSS geometry
// properties on SVG shapes (r, x, width, rx ...), which not every browser (Safari, Firefox) animates or even applies.
// The easing is the same cubic-bezier the CSS uses for --ease-out.
const bezierEase = (x1, y1, x2, y2) => (x) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 24; i += 1) {
    const cx = 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
    if (cx < x) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  return 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
};
const easeOut = bezierEase(0.22, 1, 0.36, 1);

function useTween(target, ms = 340) {
  const [v, setV] = useState(target);
  const st = useRef({ val: target, to: target, raf: 0 });
  useEffect(() => {
    const s = st.current;
    if (s.to === target) return undefined;
    cancelAnimationFrame(s.raf);
    const from = s.val;
    const t0 = performance.now();
    s.to = target;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / ms);
      s.val = from + (target - from) * easeOut(p);
      setV(s.val);
      if (p < 1) s.raf = requestAnimationFrame(tick);
    };
    s.raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(s.raf);
  }, [target, ms]);
  return v;
}

// The recording ring is split into one arc per shot by white dividers (frame 10). The arc of the shot being filmed
// is faint pink and fills to solid pink as you film; finished shots stay solid, shots still to come stay empty.
const RING_R = 55.5;
const RING_C = 2 * Math.PI * RING_R;
const RING_W = 7.4;
const PINK = '#fe2c55';
const FAINT = 'rgba(254, 44, 85, 0.28)';
// for the 3 shots in the frames the dividers sit exactly where the frame has them (139.9° and 246.5°);
// any other number of shots is split evenly
const boundsFor = (n) => (n === 3 ? [0, 139.9 / 360, 246.5 / 360, 1] : Array.from({ length: n + 1 }, (_, i) => i / n));
const polar = (turn, r) => {
  const a = turn * 2 * Math.PI - Math.PI / 2;
  return [70 + r * Math.cos(a), 70 + r * Math.sin(a)];
};

function Ring({ bounds, seg, p }) {
  const arcs = [];
  for (let k = 0; k < bounds.length - 1; k += 1) {
    const s = bounds[k] * RING_C;
    const len = (bounds[k + 1] - bounds[k]) * RING_C;
    const arc = (key, l, stroke) => (
      <circle key={key} cx="70" cy="70" r={RING_R} stroke={stroke} strokeDasharray={`${l} ${RING_C}`} strokeDashoffset={-s} />
    );
    if (k < seg) arcs.push(arc(`done${k}`, len, PINK));
    else if (k === seg) {
      arcs.push(arc('faint', len, FAINT));
      if (p > 0.002) arcs.push(arc('solid', p * len, PINK));
    }
  }
  const head = polar(bounds[seg] + p * (bounds[seg + 1] - bounds[seg]), RING_R);
  const start = polar(0, RING_R);
  return (
    <svg className="rec-ring" width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
      <g transform="rotate(-90 70 70)" fill="none" strokeWidth={RING_W}>{arcs}</g>
      {/* rounded ends, as in the frame: the very start of the ring and the moving head */}
      {(seg > 0 || p > 0.002) && <circle cx={start[0]} cy={start[1]} r={RING_W / 2} fill={PINK} />}
      {p > 0.002 && <circle cx={head[0]} cy={head[1]} r={RING_W / 2} fill={PINK} />}
      {/* white dividers between the shots */}
      {bounds.slice(1, -1).map((b, i) => {
        const [x1, y1] = polar(b, 49.9);
        const [x2, y2] = polar(b, 57.3);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth="1.2" />;
      })}
    </svg>
  );
}

// React sets `muted` as a property after the element exists, and iOS Safari only autoplays if it is muted from the start: set it by hand and start it.
const kick = (el) => {
  if (!el) return;
  el.muted = true;
  el.defaultMuted = true;
  el.play?.().catch(() => {});
};

const secondsOf = (time) => {
  const m = /(\d+)\s*-\s*(\d+)/.exec(time || '');
  return m ? Math.max(1, +m[2] - +m[1]) : 4;
};
// the plan shows the script in quotes; the caption on the filming screen does not
const captionOf = (script) => (script || '').replace(/^[“”"]+|[“”"]+$/g, '');
const wordsOf = (s) => s.split(/\s+/).filter(Boolean);

// The whole video: every shot's take played back to back (as long as it was filmed). It loops until you go back or move on.
// Layout follows the designer's screenshot of the edit screen (IMG_6966, measured at 3x): back arrow and "Add sound" on top,
// the tool column on the right, AutoCut at the bottom of the video, "Your Story" + "Next" underneath. Only the back arrow and
// "Next" do anything (back to the last segment / back to the start); "Your Story" is drawn only.
function Preview({ shots, takes, onBack, onDone }) {
  const lens = useMemo(() => shots.map((s, i) => takes[i] ?? secondsOf(s.time) * 1000), [shots, takes]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let i = 0;
    let e = 0;
    const tick = (now) => {
      e += Math.min(now - last, 100);
      last = now;
      if (e >= lens[i]) {
        e = 0;
        i = (i + 1) % lens.length;
        setIdx(i);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lens]);

  return (
    <div className="pv">
      <div className="film-panel">
        <video key={idx} ref={kick} className="film-video" src={CLIPS[Math.min(idx, CLIPS.length - 1)]} autoPlay muted playsInline preload="auto" />
      </div>
      <PreviewIcons />
      <button type="button" className="pv-back" onClick={onBack} aria-label="Back to the last segment" />
      <div className="pv-pill pv-sound">
        <span>Add sound</span>
      </div>
      <span className="cam-sep pv-sep" />
      <div className="pv-pill pv-autocut">
        <span>AutoCut</span>
      </div>
      <div className="film-actions on">
        <button type="button" className="fa fa-retake pv-story" tabIndex={-1}>
          <Avatar />
          <span>Your Story</span>
        </button>
        <button type="button" className="fa fa-next" onClick={onDone}>
          <span>Next</span>
        </button>
      </div>
    </div>
  );
}

// Filming flow (frames 9-12): per shot ready -> recording -> review (the take replays), then the next shot;
// the last shot ends with Finish, which opens the preview of the whole video.
export default function FilmFlow({ shots, onExit, onRestart, controlsRef, initial }) {
  const count = shots.length;
  const [seg, setSeg] = useState(Math.min(initial?.seg ?? 0, count - 1));
  const [phase, setPhase] = useState(initial?.phase ?? 'ready'); // ready | recording | review | preview
  const [lit, setLit] = useState(0);
  const [prog, setProg] = useState(0); // 0..1 through the shot being filmed
  const vidRef = useRef(null);
  const takes = useRef([]); // how long each shot was filmed (ms): the review and the preview replay exactly that much
  const recStart = useRef(0);
  const freeze = useRef(initial?.p ?? null); // debug: ?fp=0.66 holds the recording state at that point (used to compare with frame 10)

  const shot = shots[seg];
  const last = seg === count - 1;
  const durMs = secondsOf(shot.time) * 1000;
  const words = useMemo(() => wordsOf(captionOf(shot.script)), [shot]);
  const clip = CLIPS[Math.min(seg, CLIPS.length - 1)];
  const bounds = useMemo(() => boundsFor(count), [count]);
  const m = useTween(phase === 'recording' ? 1 : 0); // 0 = ready, 1 = recording
  const setVid = useCallback((el) => {
    vidRef.current = el;
    kick(el);
  }, []);

  const litFor = useCallback((p) => Math.min(words.length, Math.ceil((p * words.length) / 0.85)), [words.length]);

  // the recording clock: the ring fills and the caption turns cyan over the length of the shot,
  // then it stops by itself (or earlier if the stop button is tapped)
  useEffect(() => {
    if (phase !== 'recording') return undefined;
    const v = vidRef.current;
    if (v) {
      v.currentTime = 0;
      v.play?.().catch(() => {});
    }
    if (freeze.current != null) {
      setProg(freeze.current);
      setLit(litFor(freeze.current));
      return undefined;
    }
    setProg(0);
    setLit(0);
    const t0 = performance.now();
    recStart.current = t0;
    let raf = 0;
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / durMs);
      setProg(p);
      // the highlight runs slightly ahead of the ring so every word is lit a little before the shot ends
      setLit(litFor(p));
      if (p >= 1) {
        takes.current[seg] = durMs;
        setPhase('review');
      } else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, seg, durMs, litFor]);

  // review: replay the take that was just filmed (from its start, for exactly as long as it was filmed), on a loop
  useEffect(() => {
    if (phase === 'preview') {
      vidRef.current?.pause?.();
      return undefined;
    }
    if (phase !== 'review') return undefined;
    const v = vidRef.current;
    const len = (takes.current[seg] ?? durMs) / 1000;
    if (v) {
      v.currentTime = 0;
      v.play?.().catch(() => {});
    }
    const id = setInterval(() => {
      if (v && v.currentTime >= len) v.currentTime = 0;
    }, 60);
    return () => clearInterval(id);
  }, [phase, seg, durMs]);

  const go = useCallback(
    (s, p) => {
      const i = s < 0 ? count - 1 : Math.min(s, count - 1);
      setSeg(i);
      setPhase(p);
    },
    [count],
  );

  useEffect(() => {
    if (!controlsRef) return undefined;
    controlsRef.current.film = { go };
    return () => {
      delete controlsRef.current.film;
    };
  }, [controlsRef, go]);

  const onRecord = () => {
    if (phase === 'recording') {
      takes.current[seg] = Math.max(700, performance.now() - recStart.current);
      setPhase('review');
    } else setPhase('recording');
  };
  const onNext = () => {
    if (last) setPhase('preview');
    else {
      setSeg((s) => s + 1);
      setPhase('ready');
    }
  };

  const showTools = phase === 'ready' || phase === 'recording';

  return (
    <div className={`screen film-screen is-${phase}`}>
      <div className="film-panel">
        <video key={clip + seg} ref={setVid} className="film-video" src={clip} autoPlay muted loop playsInline preload="auto" />
      </div>
      <StatusBar />

      <button type="button" className="film-x" onClick={onExit} aria-label="Back to plan">
        <svg width="17.7" height="17.7" viewBox="0 0 17.7 17.7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
          <path d="M1 1 16.7 16.7M16.7 1 1 16.7" />
        </svg>
      </button>

      <div key={seg} className="film-head rise">
        <h2 className="film-title">Segment {seg + 1}</h2>
        <p className="film-sub">{shot.title}</p>
      </div>

      <div className={`film-tools ${showTools ? 'on' : ''}`}>
        <FlipIcon cx={411.6} cy={115.9} />
        <FlashIcon cx={411.6} cy={169.9} />
        <span className="cam-sep film-sep" />
        <EffectsIcon cx={411.6} cy={237.8} />
        <TimerIcon cx={411.6} cy={291.8} />
        <LayoutIcon cx={411.6} cy={345.8} />
        <BeautyIcon cx={411.6} cy={399.8} />
      </div>

      <div key={`c${seg}`} className={`film-caption rise ${showTools ? 'on' : ''}`} style={{ '--d': '120ms' }}>
        <span>
          {words.map((w, i) => (
            <Fragment key={i}>
              <span className={`fw ${phase === 'recording' && i < lit ? 'lit' : ''}`}>{w}</span>
              {i < words.length - 1 ? ' ' : ''}
            </Fragment>
          ))}
        </span>
      </div>

      <div className={`rec ${phase === 'recording' ? 'is-rec' : ''} ${showTools ? 'on' : ''}`}>
        <span className="rec-bg" />
        {/* one vector drawing for the ring and the disc, so they share exactly the same centre */}
        <svg className="rec-btn" width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
          <circle className="rb-ring" cx="70" cy="70" r={41.4 + 16.4 * m} opacity={Math.max(0, 1 - m / 0.74)} />
          <rect className="rb-core" x={33.5 + 19 * m} y={33.5 + 19 * m} width={73 - 38 * m} height={73 - 38 * m} rx={36.5 - 28.5 * m} />
        </svg>
        <Ring bounds={bounds} seg={seg} p={phase === 'recording' ? prog : 0} />
        {showTools && <button type="button" className="rec-hit" onClick={onRecord} aria-label={phase === 'recording' ? 'Stop recording' : 'Record'} />}
      </div>

      <div className={`film-actions ${phase === 'review' ? 'on' : ''}`}>
        <button type="button" className="fa fa-retake" onClick={() => setPhase('ready')} tabIndex={phase === 'review' ? 0 : -1}>Retake</button>
        <button type="button" className="fa fa-next" onClick={onNext} tabIndex={phase === 'review' ? 0 : -1}>
          <span>{last ? 'Finish' : 'Next segment'}</span>
          {last ? (
            <svg width="19" height="14" viewBox="0 0 19 14" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1.5 7.5 6.5 12.5 17.5 1.8" />
            </svg>
          ) : (
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1.5 7H18M12 1.5 18 7l-6 5.5" />
            </svg>
          )}
        </button>
      </div>

      {phase === 'preview' && <Preview shots={shots} takes={takes.current} onBack={() => setPhase('review')} onDone={onRestart} />}
    </div>
  );
}
