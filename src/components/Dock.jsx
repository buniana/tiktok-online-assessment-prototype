import { useEffect, useRef, useState } from 'react';
import VoiceWave from './VoiceWave.jsx';
import { MicIcon, PlusIcon } from './Icons.jsx';
import { SCRIPT } from '../script.js';

// The bottom control. One set of layers that morphs between:
//   orb      - idle "tap to speak" mic button (white disc with cyan / pink-purple offset rings)
//   wave     - the discs shrink into dots that shoot to the edges, drawing the 6px line; the sound wave takes over
//   bar      - "Type or speak" pill on the plan screen
// Geometry is measured from the Figma exports (orb: Ellipse 11/12/13; pill: measured from frame 07).
const LINE_Y = 809.5;
// orb -> line: the circles shrink to 14px dots and shoot out to the edges,
// the cyan one to the right and the pink-purple one to the left, drawing the line behind them.
// (14px while travelling: a touch taller than the final 6px line, which the line then thins down to)
const dot = (x) => ({ left: x - 7, top: LINE_Y - 7, width: 14, height: 14, borderRadius: 7 });
const GEO = {
  orb: {
    cyan: { left: 183, top: 764, width: 80, height: 80, borderRadius: 40 },
    grad: { left: 177, top: 767, width: 77, height: 77, borderRadius: 38.5 },
    white: { left: 182, top: 767, width: 74, height: 74, borderRadius: 37 },
    mic: { cx: 220, cy: 804, scale: 1 },
  },
  line: { cyan: dot(440), grad: dot(0), white: dot(220), mic: { cx: 220, cy: 804, scale: 0.6 } },
  bar: {
    cyan: { left: 32.4, top: 840, width: 383.2, height: 51.2, borderRadius: 25.6 },
    grad: { left: 24.4, top: 843, width: 384.2, height: 48.6, borderRadius: 24.3 },
    white: { left: 30.6, top: 842.4, width: 378.8, height: 46.8, borderRadius: 23.4 },
    mic: { cx: 381.5, cy: 865.8, scale: 0.78 },
  },
};

// orb -> line is the line -> orb animation played backwards, property by property. Line -> orb (the base CSS in styles.css) is:
//   geometry .58s ease-E, opacity .34s ease, mic scale .5s ease-E, wave clip .58s ease-E, wave fade .3s ease, wave stretch .7s ease-E
// all starting together. Reversing it in time means (a) every curve is mirrored, and (b) each property starts late enough to
// finish together with the geometry (.58s): delay = .58 - duration.
//   E    = cubic-bezier(.32,.72,0,1)     -> mirrored REV  = cubic-bezier(1,0,.68,.28)
//   ease = cubic-bezier(.25,.1,.25,1)    -> mirrored EASE_REV = cubic-bezier(.75,0,.75,.9)
const REV = 'cubic-bezier(1, 0, 0.68, 0.28)';
const EASE_REV = 'cubic-bezier(0.75, 0, 0.75, 0.9)';
const MORPH = `left 0.58s ${REV}, top 0.58s ${REV}, width 0.58s ${REV}, height 0.58s ${REV}, border-radius 0.58s ${REV}, transform 0.5s ${REV} 0.08s`;
const FADE_OUT = `opacity 0.34s ${EASE_REV} 0.24s`;

export default function Dock({ mode, levelRef, onOrbTap, onWaveTap, value, onChange, onSend, onFocus, onBlur, inputRef, lift = 0, waveStyle = 'solid' }) {
  const [stage, setStage] = useState(mode);
  const prev = useRef(mode);

  useEffect(() => {
    setStage(mode);
    prev.current = mode;
  }, [mode]);

  const shape = GEO[stage === 'wave' ? 'line' : stage === 'bar' ? 'bar' : 'orb'];

  const layerStyle = (name) => {
    let opacity = 1;
    let transform = 'none';
    let transition;
    if (stage === 'wave') {
      // the dots stay visible while they travel and fade out over the last part of the trip
      opacity = 0;
      transition = `${MORPH}, ${FADE_OUT}`;
    }
    return { ...shape[name], opacity, transform, transition };
  };

  const mic = shape.mic;
  const micHidden = stage === 'wave';
  const micTransition = micHidden ? `${FADE_OUT}, transform 0.5s ${REV} 0.08s` : undefined;

  return (
    <div className={`dock is-${stage}`} style={{ transform: `translateY(${lift}px)` }}>
      <div className="dock-layer dock-cyan" style={layerStyle('cyan')} />
      <div className="dock-layer dock-grad" style={layerStyle('grad')} />
      <div className="dock-layer dock-white" style={layerStyle('white')} />

      <div
        className="dock-mic"
        style={{
          left: mic.cx - 18,
          top: mic.cy - 18,
          opacity: micHidden ? 0 : 1,
          transform: `scale(${micHidden ? 0.6 : mic.scale})`,
          transition: micTransition,
        }}
      >
        <MicIcon />
      </div>

      {stage === 'bar' && (
        <button type="button" className="dock-pill-hit" aria-label="Type or speak" tabIndex={-1} onClick={() => inputRef?.current?.focus()} />
      )}
      <div
        className="dock-plus"
        style={{ opacity: stage === 'bar' ? 1 : 0, pointerEvents: stage === 'bar' ? 'auto' : 'none' }}
        onClick={() => inputRef?.current?.focus()}
      >
        <PlusIcon />
      </div>
      <input
        ref={inputRef}
        className="dock-input"
        style={{ opacity: stage === 'bar' ? 1 : 0, pointerEvents: stage === 'bar' ? 'auto' : 'none' }}
        placeholder={SCRIPT.inputPlaceholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSend?.();
          if (e.key === 'Escape') e.currentTarget.blur();
        }}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="send"
        inputMode="none" /* the prototype draws its own keyboard: keep the phone's off; a physical keyboard still types */
        tabIndex={stage === 'bar' ? 0 : -1}
      />

      <div className={`dock-wave ${stage === 'wave' ? 'on' : ''}`}>
        <VoiceWave levelRef={levelRef} active={stage === 'wave'} variant={waveStyle} />
      </div>

      {stage === 'orb' && <button type="button" className="dock-hit dock-hit-orb" aria-label="Tap to speak" onClick={onOrbTap} />}
      {stage === 'wave' && <button type="button" className="dock-hit dock-hit-wave" aria-label="Tap to finish" onClick={onWaveTap} />}
    </div>
  );
}
