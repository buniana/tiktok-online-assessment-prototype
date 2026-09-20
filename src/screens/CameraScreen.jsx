import StatusBar from '../components/StatusBar.jsx';
import { stroke, FlipIcon, FlashIcon, EffectsIcon, TimerIcon, LayoutIcon, BeautyIcon } from '../components/CamTools.jsx';

// Existing TikTok capture screen, drawn with SVG/CSS and aligned to your screenshot
// (positions and sizes measured from it). Only "PLAN" is new and tappable.
const MODES = [['10m', 116.6], ['60s', 169.6], ['15s', 220.2, true], ['PHOTO', 281.9], ['TEXT', 350.7]];

export default function CameraScreen({ onPlan, receding, showHint }) {
  return (
    <div className={`screen camera ${receding ? 'is-receding' : ''}`}>
      <div className="cam-panel" />
      <StatusBar />

      <svg className="cam-ic" width="32" height="32" viewBox="0 0 28 28" style={{ left: 29.6 - 16, top: 108 - 16 }} {...stroke} strokeWidth="2.8">
        <path d="M5 5l18 18M23 5 5 23" />
      </svg>
      <div className="cam-addsound">
        <svg width="16" height="18" viewBox="0 0 16 18" fill="#fff"><path d="M7.100 1.500h2.400c.1 1.900 1.500 3.100 3.700 3.400v2.400c-1.400-.1-2.600-.5-3.700-1.300v6.200c0 2-1.600 3.600-3.600 3.600s-3.600-1.600-3.600-3.600 1.600-3.600 3.600-3.600c.4 0 .8.1 1.200.2z" /></svg>
        <span>Add sound</span>
      </div>

      <FlipIcon cx={411.3} cy={109} />
      <FlashIcon cx={412} cy={161} />
      <EffectsIcon cx={412} cy={226} />
      <TimerIcon cx={412} cy={279} />
      <LayoutIcon cx={412} cy={331} />
      <BeautyIcon cx={412} cy={383} />
      {/* more */}
      <svg className="cam-ic" width="34" height="34" viewBox="0 0 30 30" style={{ left: 412 - 17, top: 430 - 17 }} {...stroke} strokeWidth="3.1">
        <path d="M4.500 10 15 20.500 25.500 10" />
      </svg>
      <span className="cam-sep" />

      {MODES.map(([t, x, on]) => (
        <span key={t} className={`cam-mode ${on ? 'on' : ''}`} style={{ left: x }}>{t}</span>
      ))}

      <span className="cam-thumb t1" />
      <span className="cam-thumb t2" />
      <span className="cam-thumb t3" />
      <div className="cam-record" />

      <span className="cam-gallery-back" />
      <span className="cam-gallery" />
      <span className="cam-tab post">POST</span>
      <button type="button" className="cam-tab plan" onClick={onPlan} aria-label="Plan with AI">PLAN</button>

      {showHint && (
        <svg className="cam-hint" width="72" height="64" viewBox="0 0 44 50" preserveAspectRatio="none" fill="#000" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round">
          <path d="M18 6a3.6 3.6 0 0 1 7.2 0V21l8-.3c2.5-.1 4.2 1.6 4.3 3.9l.4 12.5c.1 3.4-2.6 6.2-6 6.2H21.5c-2.4 0-4.6-1.3-5.8-3.4L8.4 28.4a3.4 3.4 0 0 1 5.5-3.9L18 29z" />
          <path d="M25.2 24v6M30.6 25v5.5M36 26v5" />
        </svg>
      )}
    </div>
  );
}
