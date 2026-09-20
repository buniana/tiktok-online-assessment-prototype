import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import StatusBar from '../components/StatusBar.jsx';
import Dock from '../components/Dock.jsx';
import Keyboard from '../components/Keyboard.jsx';
import { ArrowRight, ChevronLeft, TikTokGlyph } from '../components/Icons.jsx';
import { useTurnDetector } from '../hooks/useTurnDetector.js';
import { PLANS, SCRIPT } from '../script.js';

// Measured from the Figma exports (440×956 design px)
const CHAT_TOP_VOICE = 280; // first chat bubble Y
const LIVE_BOTTOM = 727; // live transcript bubble hovers with its bottom edge here, above the wave
const AI_ASK_TOP = 705.6; // AI question line box while it waits above the mic
const AI_DONE_TOP = 714.7; // "Got it" line box above the mic
const KB_LIFT = -280; // how far the input pill rides up when the keyboard opens

const EMPTY = { stage: 'none', count: 0 };
const wordsOf = (s) => (s || '').split(/\s+/).filter(Boolean);

// -------------------------------------------------------------------------------------------------
// A user bubble. While speaking it floats above the wave and words arrive one by one
// (pink -> blue -> TikTok shadow -> white); when the turn ends it glides up into the chat column.
function UserTurn({ fullText, count, stage }) {
  const slot = useRef(null);
  const floater = useRef(null);
  const [dy, setDy] = useState(0);
  const [landed, setLanded] = useState(stage === 'done');

  useLayoutEffect(() => {
    if (!slot.current || !floater.current || stage === 'done') return;
    if (stage === 'live') {
      const h = floater.current.offsetHeight;
      setDy(LIVE_BOTTOM - CHAT_TOP_VOICE - slot.current.offsetTop - h);
    } else if (stage === 'placed') {
      setDy(0);
    }
  }, [stage, count, fullText]);

  useEffect(() => {
    if (stage !== 'placed') return undefined;
    const id = setTimeout(() => setLanded(true), 700);
    return () => clearTimeout(id);
  }, [stage]);

  const words = wordsOf(fullText).slice(0, count);
  const flying = stage === 'live' || (stage === 'placed' && !landed);

  return (
    <>
      <div ref={slot} className="bubble" style={{ visibility: stage === 'done' || landed ? 'visible' : 'hidden' }}>
        <span>{fullText}</span>
      </div>
      {flying && (
        <div
          ref={floater}
          className={`bubble bubble-float ${stage === 'live' ? 'is-live' : 'is-landing'}`}
          style={{ top: slot.current ? slot.current.offsetTop : 0, transform: `translateY(${dy}px)` }}
        >
          <span>
            {words.length ? (
              words.map((w, i) => (
                <Fragment key={i}>
                  <span className="word">{w}</span>
                  {i < words.length - 1 ? ' ' : ''}
                </Fragment>
              ))
            ) : (
              ' '
            )}
          </span>
        </div>
      )}
    </>
  );
}

// The AI's latest line waits above the mic; when the user starts answering it glides up into the chat column.
function AiTurn({ text, stage }) {
  const slot = useRef(null);
  const [dy, setDy] = useState(0);
  const [landed, setLanded] = useState(stage === 'done');

  useLayoutEffect(() => {
    if (!slot.current || stage === 'done') return;
    setDy(stage === 'bottom' ? AI_ASK_TOP - CHAT_TOP_VOICE - slot.current.offsetTop : 0);
  }, [stage, text]);

  useEffect(() => {
    if (stage !== 'column') return undefined;
    const id = setTimeout(() => setLanded(true), 720);
    return () => clearTimeout(id);
  }, [stage]);

  const flying = stage === 'bottom' || (stage === 'column' && !landed);
  return (
    <>
      <p ref={slot} className="ai-line" style={{ visibility: stage === 'done' || landed ? 'visible' : 'hidden' }}>{text}</p>
      {flying && (
        <p
          className={`ai-line ai-float ${stage === 'bottom' ? 'is-bottom' : 'is-gliding'}`}
          style={{ top: slot.current ? slot.current.offsetTop : 0, transform: `translateY(${dy}px)` }}
        >
          {text}
        </p>
      )}
    </>
  );
}

function ThinkingRow({ delay = 0 }) {
  return (
    <div className="thinking rise" style={{ '--d': `${delay}ms` }}>
      <span className="hop glyph" style={{ '--i': 0 }}>
        <TikTokGlyph size={21} />
      </span>
      {[...SCRIPT.thinking].map((ch, i) => (
        <span key={i} className="hop" style={{ '--i': i + 1 }}>{ch}</span>
      ))}
    </div>
  );
}

function PlanBlock({ plan, showCta, onReady }) {
  return (
    <div className="plan">
      <p className="plan-intro rise" style={{ '--d': '0ms' }}>{plan.intro}</p>
      <h2 className="plan-title rise" style={{ '--d': '90ms' }}>{plan.title}</h2>
      <div className="shots">
        {plan.shots.map((s, i) => (
          <div key={i} className={`shot rise ${s.isNew ? 'is-new' : ''}`} style={{ '--d': `${180 + i * 110}ms` }}>
            <span className="shot-bar" />
            <div className="shot-body">
              <div className="shot-head">
                <span className={s.hl?.includes('time') ? 'hl' : ''}>{s.time}</span>
                <br />
                <span className={s.hl?.includes('title') || s.isNew ? 'hl' : ''}>{s.title}</span>
              </div>
              <div className="shot-script">
                <b>Script:</b> <span className={s.isNew ? 'hl' : ''}>{s.script}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className={`cta rise ${showCta ? '' : 'cta-hidden'}`} style={{ '--d': `${200 + plan.shots.length * 110}ms` }} onClick={onReady}>
        <span>{SCRIPT.cta}</span>
        <ArrowRight />
      </button>
    </div>
  );
}

// -------------------------------------------------------------------------------------------------
export default function PlanFlow({ mic, lines, controlsRef, onPhase, onReadyToFilm, onBack, onLeaving, tts, kbTheme, waveStyle, simInput }) {
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef(0);
  const [phase, setPhase] = useState('enter'); // enter | listen1 | ask1 | listen2 | done | think | plan
  const [u, setU] = useState([EMPTY, EMPTY]);
  const [ai1, setAi1] = useState(null); // null | bottom | column | done
  const [aiDone, setAiDone] = useState(false);
  const [forceKey, setForceKey] = useState(0);
  const [typed, setTyped] = useState('');
  const [kbOpen, setKbOpen] = useState(false);
  const [kbTouched, setKbTouched] = useState(false);
  const [extra, setExtra] = useState([]); // typed refinements: user bubble / thinking / updated plan
  const inputRef = useRef(null);

  const timers = useRef([]);
  const revealRef = useRef(0);
  const lastRevealAt = useRef(0);
  const chatRef = useRef(null);
  const uRef = useRef(u);
  uRef.current = u;
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const ttsRef = useRef(tts);
  ttsRef.current = tts;

  const later = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const patchU = useCallback((i, patch) => {
    setU((prev) =>
      prev.map((cur, k) => {
        if (k !== i) return cur;
        const next = typeof patch === 'function' ? patch(cur) : { ...cur, ...patch };
        return next === cur || (next.stage === cur.stage && next.count === cur.count) ? cur : next;
      }),
    );
  }, []);

  const speak = useCallback((text) => {
    if (!ttsRef.current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }, []);

  // ---- enter animation + start listening --------------------------------------------------
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
    later(() => setPhase((p) => (p === 'enter' ? 'listen1' : p)), 620);
    return () => {
      clearTimers();
      clearTimeout(leaveTimer.current);
      window.speechSynthesis?.cancel();
      mic.stop?.(); // leaving the feature lets go of the microphone
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back (top-left of the plan screen): the chat slides back down while the camera screen comes back up, then the whole
  // chat is thrown away, so the next tap on PLAN starts a fresh conversation.
  const leave = useCallback(() => {
    if (leaveTimer.current) return;
    clearTimers();
    window.speechSynthesis?.cancel();
    inputRef.current?.blur();
    setLeaving(true);
    setShown(false);
    onLeaving?.();
    leaveTimer.current = setTimeout(() => onBack?.(), 480);
  }, [clearTimers, onBack, onLeaving]);

  // The real microphone is only used while simulated sound input is off, so with it on nothing ever asks the browser for
  // the mic. Turning simulated sound on while the real mic is running lets go of it; turning it off asks for it.
  const prevSim = useRef(null);
  useEffect(() => {
    if (!simInput) mic.start();
    else if (prevSim.current === false) mic.stop();
    prevSim.current = simInput;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simInput]);

  useEffect(() => {
    onPhase?.(phase);
  }, [phase, onPhase]);

  // ---- turn handling ---------------------------------------------------------------------
  const listening = phase === 'listen1' || phase === 'listen2';
  const idx = phase === 'listen1' ? 0 : 1;

  // Simulated sound input (on by default, debug panel / S key): each time the app starts listening it "speaks" the line
  // by itself, for about as long as the words take to say, then goes quiet so the turn ends on its own.
  // Tapping the wave still ends the turn early.
  useEffect(() => {
    if (!simInput || !listening) return undefined;
    const words = wordsOf(linesRef.current[idx]).length;
    const ms = Math.max(1600, (words / 3.2) * 1000 + 300);
    let started = false;
    const id = setTimeout(() => {
      started = true;
      mic.simulate(ms);
    }, phase === 'listen1' ? 700 : 450);
    return () => {
      clearTimeout(id);
      if (started) mic.simulate(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simInput, listening, phase]);

  const land = useCallback(
    (i) => {
      patchU(i, { stage: 'placed', count: wordsOf(linesRef.current[i]).length });
      later(() => {
        if (i === 0) {
          setAi1('bottom');
          speak(SCRIPT.aiQuestion);
          later(() => setPhase('ask1'), 520);
        } else {
          setAiDone(true);
          speak(SCRIPT.aiDone);
          setPhase('done');
          later(() => setPhase('think'), 1600);
          later(() => setPhase('plan'), 4200);
        }
      }, 700);
    },
    [later, patchU, speak],
  );

  // Flush any words not revealed yet (each with its own colour hand-off), then let the bubble settle.
  const finishTurn = useCallback(
    (i) => {
      const all = wordsOf(linesRef.current[i]).length;
      patchU(i, (cur) => (cur.stage === 'none' ? { stage: 'live', count: 1 } : { ...cur, stage: 'live' }));
      let n = Math.max(1, uRef.current[i].count);
      // catch up gradually: start near the pace words were already arriving at and ease down to a floor
      // that keeps the whole catch-up under ~2s, so there is never a stampede
      let g = 400;
      const gap = () => {
        g = Math.max(g * 0.85, Math.min(230, Math.max(110, 2000 / Math.max(1, all - n))));
        return g;
      };
      const step = () => {
        n += 1;
        patchU(i, { stage: 'live', count: Math.min(n, all) });
        if (n < all) later(step, gap());
        else later(() => land(i), 460);
      };
      if (n >= all) later(() => land(i), 460);
      else later(step, Math.max(40, gap() - (performance.now() - lastRevealAt.current))); // count time already waited since the last word
    },
    [land, later, patchU],
  );

  useTurnDetector({
    active: listening,
    levelRef: mic.instRef,
    forceEndKey: forceKey,
    onStart: () => {
      revealRef.current = 1;
      lastRevealAt.current = performance.now();
      patchU(idx, { stage: 'live', count: 1 });
    },
    onTick: (dt, loud) => {
      // words keep flowing through short pauses and the end-of-speech wait, just slower, so the
      // reveal eases out instead of freezing and then bursting
      const before = Math.floor(revealRef.current);
      revealRef.current += (dt / 1000) * (loud ? 3.2 : 2.2);
      if (Math.floor(revealRef.current) !== before) lastRevealAt.current = performance.now();
      const n = Math.min(Math.max(1, wordsOf(linesRef.current[idx]).length - 1), Math.floor(revealRef.current));
      patchU(idx, (cur) => (cur.stage === 'live' && cur.count !== n ? { ...cur, count: n } : cur));
    },
    onEnd: () => finishTurn(idx),
    // too short to be speech (noise): take the half-started bubble away again
    onCancel: () => {
      revealRef.current = 0;
      patchU(idx, EMPTY);
    },
  });

  const onOrbTap = async () => {
    if (!simInput) await mic.start();
    setAi1((s) => (s === 'bottom' ? 'column' : s));
    setPhase('listen2');
  };
  const onWaveTap = () => setForceKey((k) => k + 1);

  // ---- scrolling ----------------------------------------------------------------------------
  const scrollToBottom = useCallback((smooth = true) => {
    const el = chatRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // keep the newest content glued to the bottom while the chat area resizes with the keyboard
  const pinBottom = useCallback((ms) => {
    const el = chatRef.current;
    if (!el) return;
    const t0 = performance.now();
    const step = () => {
      el.scrollTop = el.scrollHeight - el.clientHeight;
      if (performance.now() - t0 < ms) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (phase !== 'plan') return undefined;
    const id = later(() => scrollToBottom(true), 380);
    return () => clearTimeout(id);
  }, [phase, later, scrollToBottom]);

  const firstKb = useRef(true);
  useEffect(() => {
    if (firstKb.current) {
      firstKb.current = false;
      return;
    }
    const el = chatRef.current;
    if (!el || phase !== 'plan') return;
    const wasBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    if (wasBottom) pinBottom(520);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kbOpen]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el || phase !== 'plan' || !extra.length) return undefined;
    const last = extra[extra.length - 1];
    const id = later(() => {
      if (last.type === 'plan') {
        const blocks = el.querySelectorAll('.plan');
        const block = blocks[blocks.length - 1];
        if (block) el.scrollTo({ top: block.offsetTop - 22, behavior: 'smooth' });
      } else {
        scrollToBottom(true);
      }
    }, 40);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extra]);

  // ---- typing (phone keyboard) -> updated plan ----------------------------------------------
  const sendTyped = useCallback(() => {
    const text = typed.trim();
    if (!text) return;
    const id = Date.now();
    setExtra((a) => [...a, { id, type: 'user', text }, { id: id + 1, type: 'thinking' }]);
    setTyped('');
    later(() => setExtra((a) => a.map((e) => (e.id === id + 1 ? { id: id + 1, type: 'plan', ver: 1 } : e))), 2600);
  }, [typed, later]);

  // ---- debug controls ----------------------------------------------------------------------
  useEffect(() => {
    if (!controlsRef) return;
    controlsRef.current = {
      simulateSpeech: () => mic.simulate(2800),
      sendNow: () => setForceKey((k) => k + 1),
      jumpTo: (target) => {
        clearTimers();
        const done = { stage: 'done', count: 99 };
        const past1 = ['ask1', 'listen2', 'done', 'think', 'plan'].includes(target);
        const past2 = ['done', 'think', 'plan'].includes(target);
        setAi1(target === 'ask1' ? 'bottom' : past1 ? 'done' : null);
        setAiDone(target === 'done');
        setU([past1 ? done : EMPTY, past2 ? done : EMPTY]);
        setExtra([]);
        setPhase(target);
      },
    };
  });

  const planMode = phase === 'think' || phase === 'plan';
  const dockMode = listening || phase === 'enter' ? 'wave' : phase === 'ask1' || phase === 'done' ? 'orb' : 'bar';
  const typing = kbOpen && dockMode === 'bar';
  const heroLow = (phase === 'enter' || phase === 'listen1') && (u[0].stage === 'none' || u[0].stage === 'live');
  const listeningOn = dockMode === 'wave' && phase !== 'enter';
  const cls = ['screen', 'flow', shown ? 'is-open' : '', leaving ? 'is-leaving' : '', planMode ? 'is-plan' : '', typing ? 'kb-open' : '', kbTouched ? 'kb-touched' : '']
    .filter(Boolean)
    .join(' ');
  const lastPlanIdx = extra.reduce((acc, e, i) => (e.type === 'plan' ? i : acc), -1);

  return (
    <div className={cls}>
      <StatusBar />

      <header className="nav">
        <button type="button" className="nav-back" aria-label="Back" onClick={leave}>
          <ChevronLeft />
        </button>
        <h1 className="nav-title">PLAN</h1>
        <div className="nav-rule" />
      </header>

      <div className={`hero ${heroLow ? 'is-low' : ''}`}>
        <div className="hero-in">
          <h1 className="hero-title">
            {SCRIPT.title[0]}
            <br />
            {SCRIPT.title[1]}
            <span className="accent">{SCRIPT.title[2]}</span>
            {SCRIPT.title[3]}
          </h1>
          <p className="hero-sub">{SCRIPT.subtitle}</p>
        </div>
      </div>

      <div ref={chatRef} className="chat">
        {u[0].stage !== 'none' && <UserTurn fullText={lines[0]} count={u[0].count} stage={u[0].stage} />}
        {ai1 && <AiTurn text={SCRIPT.aiQuestion} stage={ai1} />}
        {u[1].stage !== 'none' && <UserTurn fullText={lines[1]} count={u[1].count} stage={u[1].stage} />}

        {phase === 'think' && <ThinkingRow />}

        {phase === 'plan' && <PlanBlock plan={PLANS[0]} showCta={extra.length === 0} onReady={() => onReadyToFilm?.(PLANS[0])} />}

        {extra.map((e, i) =>
          e.type === 'user' ? (
            <div key={e.id} className="bubble rise">{e.text}</div>
          ) : e.type === 'thinking' ? (
            <ThinkingRow key={e.id} delay={250} />
          ) : (
            <PlanBlock key={e.id} plan={PLANS[e.ver]} showCta={i === lastPlanIdx} onReady={() => onReadyToFilm?.(PLANS[e.ver])} />
          ),
        )}
      </div>

      {aiDone && phase === 'done' && <p className="ai-line ai-bottom rise" style={{ top: AI_DONE_TOP }}>{SCRIPT.aiDone}</p>}

      <div className={`listening ${listeningOn ? 'on' : ''}`} aria-hidden="true">
        <span className="breathe">
          {SCRIPT.listening}
          {[0, 1, 2].map((i) => (
            <span key={i} className="hop" style={{ '--i': i }}>.</span>
          ))}
        </span>
      </div>

      <Dock
        mode={dockMode}
        levelRef={mic.levelRef}
        onOrbTap={onOrbTap}
        onWaveTap={onWaveTap}
        value={typed}
        onChange={setTyped}
        onSend={sendTyped}
        onFocus={() => {
          setKbTouched(true);
          setKbOpen(true);
        }}
        onBlur={() => setKbOpen(false)}
        inputRef={inputRef}
        lift={typing ? KB_LIFT : 0}
        waveStyle={waveStyle}
      />
      <Keyboard
        open={typing}
        value={typed}
        theme={kbTheme}
        onKey={(ch) => setTyped((v) => v + ch)}
        onBackspace={() => setTyped((v) => v.slice(0, -1))}
        onSend={sendTyped}
      />
    </div>
  );
}
