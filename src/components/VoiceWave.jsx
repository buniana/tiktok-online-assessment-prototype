import { useEffect, useRef } from 'react';

// Listening visual.
//   - a permanent 6px gradient line across the full width
//   - as you speak, a lens-shaped swell is born at the RIGHT edge and travels LEFT, dissolving before the far edge
// Two looks (switchable in the debug panel):
//   solid - flat, opaque colour blocks. White swell with the same cyan / pink offsets as the mic orb. No blur, no glow.
//   glow  - the earlier soft-glow version: blurred gradient bloom, white core, braided strands, additive sparks.

const W = 440;
const H = 160;
const CY = 80;
const SPEED = 150; // px/s, newest audio enters at the right edge and drifts left
const MAXH = 14.5; // max half-height of the white body; with the cyan / pink fringes the whole swell is 39px tall at the loudest
const BAND = 19.5; // nothing (swell, fringes, sparks) is drawn further than this from the line, so the whole wave stays within 39px
const LINE = 6;
const CYAN = '#00D0D5';
const PINK = '#FE2C55';
const RGB = [
  [0, 208, 213],
  [180, 165, 217],
  [254, 44, 85],
];

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function colorAt(u) {
  const c = Math.min(1, Math.max(0, u));
  const [i, j, k] = c < 0.51 ? [0, 1, c / 0.51] : [1, 2, (c - 0.51) / 0.49];
  return RGB[i].map((v, n) => Math.round(v + (RGB[j][n] - v) * k));
}

function brand(ctx) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, CYAN);
  g.addColorStop(0.51, '#B4A5D9');
  g.addColorStop(1, PINK);
  return g;
}

export default function VoiceWave({ levelRef, active = true, variant = 'solid' }) {
  const glowRef = useRef(null);
  const coreRef = useRef(null);
  const crispRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;
  const variantRef = useRef(variant);
  variantRef.current = variant;

  useEffect(() => {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const [gctx, cctx, sctx] = [glowRef, coreRef, crispRef].map((r) => {
      const c = r.current;
      c.width = W * dpr;
      c.height = H * dpr;
      const ctx = c.getContext('2d');
      ctx.scale(dpr, dpr);
      return ctx;
    });

    let samples = [];
    let sparks = [];
    let env = 0;
    let last = performance.now() / 1000;
    let raf = 0;

    const frame = (nowMs) => {
      raf = requestAnimationFrame(frame);
      if (!activeRef.current) {
        if (samples.length) {
          samples = [];
          sparks = [];
          env = 0;
        }
        return;
      }
      const solid = variantRef.current === 'solid';
      const now = nowMs / 1000;
      const dt = Math.min(0.05, now - last);
      last = now;

      const L = levelRef.current;
      env += (L - env) * (L > env ? 0.28 : 0.045);
      samples.push({ t: now, v: env });
      while (samples.length > 2 && (now - samples[0].t) * SPEED > W + 30) samples.shift();

      // swell geometry: x from sample age, half-height from loudness, tapered at both ends
      const pts = samples.map((s) => {
        const x = W - (now - s.t) * SPEED;
        const taper = smooth(0, 170, x) * smooth(0, 46, W - x);
        return { x, t: s.t, h: MAXH * Math.pow(s.v, 0.85) * taper };
      });

      const swell = (ctx, sc, pad = 0, dx = 0, dy = 0) => {
        const half = (p) => p.h * sc + pad * Math.min(1, p.h / 5);
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p.x + dx, CY + dy - half(p)) : ctx.moveTo(p.x + dx, CY + dy - half(p))));
        for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i].x + dx, CY + dy + half(pts[i]));
        ctx.closePath();
      };

      // sparks shed at loud moments
      if (env > 0.3 && Math.random() < 0.6 * env && sparks.length < 70) {
        const x = W - 22 - Math.random() * 30;
        sparks.push({
          x,
          y: CY + (Math.random() * 2 - 1) * MAXH * env * 0.9,
          vx: -SPEED * (0.8 + Math.random() * 0.4),
          vy: (Math.random() * 2 - 1) * 30,
          r: solid ? 1.6 + Math.random() * 2 : 0.8 + Math.random() * 1.5,
          life: 0.7 + Math.random() * 0.6,
          rgb: colorAt(x / W).join(','),
          pick: Math.random(),
        });
      }
      sparks = sparks.filter((s) => s.life > 0 && s.x > -6);
      sparks.forEach((s) => {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy *= 0.97;
        s.life -= dt;
        const lim = BAND - s.r;
        if (Math.abs(s.y - CY) > lim) {
          s.y = CY + Math.sign(s.y - CY) * lim;
          s.vy *= -0.4;
        }
      });

      [gctx, cctx, sctx].forEach((c) => c.clearRect(0, 0, W, H));

      // ======================================================================= SOLID
      if (solid) {
        sctx.save();
        // permanent 6px line (opaque brand gradient)
        sctx.lineCap = 'round';
        sctx.lineWidth = LINE;
        sctx.strokeStyle = brand(sctx);
        sctx.beginPath();
        sctx.moveTo(-4, CY);
        sctx.lineTo(W + 4, CY);
        sctx.stroke();

        // swell: cyan + pink offsets behind a white lens (same chromatic offsets as the mic orb)
        [
          [CYAN, 1.14, 2.5, 4, -1.5],
          [PINK, 1.07, 1.5, -3.5, 1.5],
          ['#fff', 1, 0, 0, 0],
        ].forEach(([c, sc, pad, dx, dy]) => {
          sctx.fillStyle = c;
          swell(sctx, sc, pad, dx, dy);
          sctx.fill();
        });

        // right-edge emitter: three flat discs, only while there is sound (invisible at rest)
        if (env > 0.06) {
          const er = 2 + 9 * env;
          [
            [CYAN, 4, 0, er + 2],
            [PINK, -3, 1, er + 1],
            ['#fff', 0, 0, er],
          ].forEach(([c, dx, dy, r]) => {
            sctx.fillStyle = c;
            sctx.beginPath();
            sctx.arc(W - 2 + dx, CY + dy, r, 0, Math.PI * 2);
            sctx.fill();
          });
        }

        // sparks: flat dots in brand colours
        sparks.forEach((s) => {
          sctx.globalAlpha = Math.min(1, s.life * 2.2);
          sctx.fillStyle = s.pick < 0.4 ? CYAN : s.pick < 0.8 ? PINK : '#fff';
          sctx.beginPath();
          sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          sctx.fill();
        });
        sctx.restore();
        return;
      }

      // ======================================================================= GLOW
      const edge = (ctx, dir) => {
        ctx.beginPath();
        pts.forEach((p, i) => (i ? ctx.lineTo(p.x, CY + dir * p.h) : ctx.moveTo(p.x, CY + dir * p.h)));
      };
      const strand = (ctx, freq, phase, amp) => {
        ctx.beginPath();
        pts.forEach((p, i) => {
          const y = CY + p.h * amp * Math.sin(p.t * freq * Math.PI * 2 + phase);
          if (i) ctx.lineTo(p.x, y);
          else ctx.moveTo(p.x, y);
        });
      };
      const breathe = 0.85 + 0.15 * Math.sin(now * 2.2);
      const emitterR = 10 + 26 * env;

      gctx.save();
      gctx.strokeStyle = brand(gctx);
      gctx.lineWidth = LINE;
      gctx.lineCap = 'round';
      gctx.globalAlpha = (0.55 + 0.4 * env) * breathe;
      gctx.beginPath();
      gctx.moveTo(-4, CY);
      gctx.lineTo(W + 4, CY);
      gctx.stroke();
      gctx.fillStyle = brand(gctx);
      gctx.globalAlpha = 0.5 + 0.45 * Math.min(1, env * 1.5);
      swell(gctx, 1.45);
      gctx.fill();
      gctx.globalCompositeOperation = 'lighter';
      const eg = gctx.createRadialGradient(W - 4, CY, 0, W - 4, CY, emitterR * 1.8);
      eg.addColorStop(0, 'rgba(254,44,85,0.9)');
      eg.addColorStop(1, 'rgba(254,44,85,0)');
      gctx.globalAlpha = 0.25 + 0.75 * env;
      gctx.fillStyle = eg;
      gctx.fillRect(W - emitterR * 2.4, CY - emitterR * 2.4, emitterR * 2.4, emitterR * 4.8);
      sparks.forEach((s) => {
        gctx.globalAlpha = Math.min(1, s.life * 1.6) * 0.8;
        gctx.fillStyle = `rgb(${s.rgb})`;
        gctx.beginPath();
        gctx.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2);
        gctx.fill();
      });
      gctx.restore();

      cctx.save();
      cctx.fillStyle = '#fff';
      cctx.globalAlpha = 0.9;
      swell(cctx, 0.62);
      cctx.fill();
      cctx.globalAlpha = 0.4 + 0.4 * env;
      cctx.fillRect(0, CY - 1.1, W, 2.2);
      const cg = cctx.createRadialGradient(W - 4, CY, 0, W - 4, CY, emitterR);
      cg.addColorStop(0, 'rgba(255,255,255,1)');
      cg.addColorStop(0.4, 'rgba(255,120,150,0.6)');
      cg.addColorStop(1, 'rgba(254,44,85,0)');
      cctx.globalAlpha = 0.35 + 0.65 * env;
      cctx.fillStyle = cg;
      cctx.fillRect(W - emitterR * 1.6, CY - emitterR * 1.6, emitterR * 1.6, emitterR * 3.2);
      cctx.restore();

      sctx.save();
      const bg = brand(sctx);
      sctx.fillStyle = bg;
      sctx.strokeStyle = bg;
      sctx.globalAlpha = 0.3;
      swell(sctx, 1);
      sctx.fill();
      sctx.globalAlpha = 1;
      sctx.lineWidth = 1.4;
      sctx.lineJoin = 'round';
      edge(sctx, -1);
      sctx.stroke();
      edge(sctx, 1);
      sctx.stroke();
      sctx.lineWidth = 1;
      sctx.globalAlpha = 0.85;
      strand(sctx, 1.7, 0, 0.92);
      sctx.stroke();
      strand(sctx, 2.3, 2.1, 0.7);
      sctx.stroke();
      strand(sctx, 1.2, 4.2, 0.5);
      sctx.stroke();
      sctx.globalAlpha = 1;
      sctx.lineWidth = LINE;
      sctx.lineCap = 'round';
      sctx.beginPath();
      sctx.moveTo(-4, CY);
      sctx.lineTo(W + 4, CY);
      sctx.stroke();
      sctx.globalCompositeOperation = 'lighter';
      sparks.forEach((s) => {
        sctx.globalAlpha = Math.min(1, s.life * 1.8);
        sctx.fillStyle = `rgb(${s.rgb})`;
        sctx.beginPath();
        sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        sctx.fill();
      });
      sctx.restore();
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [levelRef]);

  return (
    <div className={`wave is-${variant}`} aria-hidden="true">
      <canvas ref={glowRef} className="wave-glow" />
      <canvas ref={coreRef} className="wave-core" />
      <canvas ref={crispRef} className="wave-crisp" />
    </div>
  );
}
