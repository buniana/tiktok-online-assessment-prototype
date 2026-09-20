import { useEffect, useRef } from 'react';

// Watches the loudness level and reports when the user starts talking, keeps talking, and stops.
// Bumping `forceEndKey` ends the current turn early (tap-to-stop, debug "send now").
//
// A turn only starts after about 0.4s of real speech, so a click, a cough or a bit of background noise does not
// make the chat pop up; a start that turns out too short is cancelled (`onCancel`) instead of hanging open.
const LOUD = 0.14;
const START_MS = 400; // net loud time before a turn starts
const MIN_TURN_MS = 800; // a turn shorter than this is treated as noise
const END_SILENCE_MS = 1300;

export function useTurnDetector({ active, levelRef, onStart, onTick, onEnd, onCancel, forceEndKey }) {
  const cb = useRef({});
  cb.current = { onStart, onTick, onEnd, onCancel };
  const keyRef = useRef(forceEndKey);
  keyRef.current = forceEndKey;

  useEffect(() => {
    if (!active) return undefined;
    const startKey = keyRef.current;
    let raf = 0;
    let last = performance.now();
    let started = false;
    let arm = 0; // builds up while it is loud, drains at half speed while it is quiet
    let speechMs = 0;
    let silenceMs = 0;

    const loop = (now) => {
      const dt = Math.min(now - last, 100); // a backgrounded tab must not count as a long stretch of speech
      last = now;
      const loud = levelRef.current > LOUD;
      if (!started) {
        arm = loud ? arm + dt : Math.max(0, arm - dt * 0.5);
        if (arm >= START_MS) {
          started = true;
          speechMs = arm;
          silenceMs = 0;
          cb.current.onStart?.();
        }
      } else {
        if (loud) {
          speechMs += dt;
          silenceMs = 0;
        } else {
          silenceMs += dt;
        }
        cb.current.onTick?.(dt, loud);
        if (silenceMs > END_SILENCE_MS && speechMs < MIN_TURN_MS) {
          started = false;
          arm = 0;
          speechMs = 0;
          silenceMs = 0;
          cb.current.onCancel?.();
        }
      }

      const forced = keyRef.current !== startKey;
      if ((started && silenceMs > END_SILENCE_MS) || forced) {
        cb.current.onEnd?.({ started, forced });
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, levelRef]);
}
