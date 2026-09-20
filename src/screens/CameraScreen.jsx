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
        // the designer's Frame.svg (drawn 86 x 74, shown at 85 %; the tilt is part of the drawing)
        <svg className="cam-hint" width="73.1" height="62.9" viewBox="0 0 86 74" fill="none" aria-hidden="true">
          <g clipPath="url(#clip0_58_1273)">
            <path d="M31.1865 48.9929L26.5703 34.1241C25.875 31.8844 27.1269 29.5053 29.3665 28.81C31.6062 28.1147 33.9853 29.3665 34.6806 31.6062L39.2967 46.475" stroke="white" strokeWidth="4" strokeLinejoin="round" />
            <path d="M63.2079 37.5696L65.9356 46.3557C68.6009 54.9409 63.802 64.0611 55.2169 66.7264L53.8652 67.146C45.2801 69.8113 36.1599 65.0124 33.4946 56.4273L30.7668 47.6412" stroke="white" strokeWidth="4" strokeLinejoin="round" />
            <path d="M40.5557 50.5301L39.7608 47.9697L38.4574 43.7715C37.7621 41.5319 39.014 39.1528 41.2536 38.4574C43.4933 37.7621 45.8724 39.014 46.5677 41.2536L47.9029 45.5545L48.6659 48.0122" stroke="white" strokeWidth="4" strokeLinejoin="round" />
            <path d="M48.666 48.012L47.8711 45.4516L46.5678 41.2535C45.8725 39.0138 47.1243 36.6347 49.364 35.9394C51.6036 35.2441 53.9827 36.4959 54.678 38.7356L56.0133 43.0364L56.7763 45.4941" stroke="white" strokeWidth="4" strokeLinejoin="round" />
            <path d="M56.7763 45.4944L55.9814 42.934L54.678 38.7359C53.9827 36.4962 55.2345 34.1171 57.4742 33.4218C59.7138 32.7265 62.093 33.9783 62.7883 36.218L64.1235 40.5189L64.8865 42.9765" stroke="white" strokeWidth="4" strokeLinejoin="round" />
            <path d="M44.1426 28.6686C43.7015 27.2479 43.057 25.9464 42.2511 24.786C41.3499 23.4884 40.2468 22.3675 39.0003 21.4542C35.5056 18.8935 30.8843 17.9648 26.429 19.348C21.9736 20.7312 18.6908 24.1138 17.2607 28.2034C16.7506 29.6621 16.4762 31.2106 16.4683 32.7905C16.4613 34.2032 16.6673 35.6408 17.1084 37.0616" stroke="white" strokeWidth="4" />
          </g>
          <defs>
            <clipPath id="clip0_58_1273">
              <rect width="67.937" height="67.937" fill="white" transform="translate(0 20.1432) rotate(-17.2474)" />
            </clipPath>
          </defs>
        </svg>
      )}
    </div>
  );
}
