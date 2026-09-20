import { useCallback, useEffect, useRef, useState } from 'react';

// Normalized 0..1 loudness, updated every animation frame into `levelRef`.
// Real microphone when permitted; `simulate(ms)` produces a speech-like envelope for demos without a mic.
export function useMic() {
  const [status, setStatus] = useState('idle'); // idle | requesting | ready | denied | unsupported
  const levelRef = useRef(0);
  const instRef = useRef(0); // the same loudness without the smoothing tail: used to decide when someone really is speaking
  const rawRef = useRef(0);
  const simUntil = useRef(0);
  const audio = useRef({ ctx: null, stream: null, analyser: null, data: null });
  const raf = useRef(0);

  const loop = useCallback(() => {
    const a = audio.current;
    let target = 0;
    if (a.analyser) {
      a.analyser.getByteTimeDomainData(a.data);
      let sum = 0;
      for (let i = 0; i < a.data.length; i++) {
        const v = (a.data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / a.data.length);
      rawRef.current = rms;
      target = Math.min(1, Math.max(0, (rms - 0.012) / 0.14));
    }
    const now = performance.now();
    if (now < simUntil.current) {
      const t = now / 1000;
      const syllable = 0.5 + 0.5 * Math.sin(t * 13) * Math.sin(t * 4.3 + 1);
      target = Math.max(target, Math.min(1, 0.32 + 0.5 * Math.abs(syllable) + 0.12 * Math.sin(t * 29)));
    }
    instRef.current = target;
    const cur = levelRef.current;
    levelRef.current = cur + (target - cur) * (target > cur ? 0.45 : 0.09);
    raf.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [loop]);

  const start = useCallback(async () => {
    if (audio.current.analyser) return true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return false;
    }
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.6;
      src.connect(analyser);
      audio.current = { ctx, stream, analyser, data: new Uint8Array(analyser.fftSize) };
      setStatus('ready');
      return true;
    } catch {
      setStatus('denied');
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    const a = audio.current;
    a.stream?.getTracks().forEach((t) => t.stop());
    a.ctx?.close();
    audio.current = { ctx: null, stream: null, analyser: null, data: null };
    setStatus('idle');
  }, []);

  const simulate = useCallback((ms = 2600) => {
    simUntil.current = performance.now() + ms;
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { status, levelRef, instRef, rawRef, start, stop, simulate };
}
