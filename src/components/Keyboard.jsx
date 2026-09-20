import { useState } from 'react';

const LETTERS = ['qwertyuiop'.split(''), 'asdfghjkl'.split(''), 'zxcvbnm'.split('')];
const NUMBERS = ['1234567890'.split(''), ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'], ['.', ',', '?', '!', "'"]];

const Shift = ({ on }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <path d="M11 3.5 3.5 11.5h4.2v6h6.6v-6h4.2z" />
  </svg>
);
const Delete = () => (
  <svg width="26" height="20" viewBox="0 0 26 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
    <path d="M8.5 2.5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2h-13L2.5 10z" />
    <path d="m12.5 7 6 6m0-6-6 6" />
  </svg>
);
const Globe = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </svg>
);
const Mic = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />
  </svg>
);

// iOS-style keyboard. Keys act on pointer-down and never steal focus from the input,
// so the caret stays put exactly like on a phone.
export default function Keyboard({ open, value, onKey, onBackspace, onSend, theme = 'dark' }) {
  const [layout, setLayout] = useState('letters');
  const [shiftOnce, setShiftOnce] = useState(false);

  const autoShift = layout === 'letters' && (value.length === 0 || /[.!?]\s$/.test(value));
  const shifted = layout === 'letters' && (shiftOnce || autoShift);
  const rows = layout === 'letters' ? LETTERS : NUMBERS;

  const word = value.split(/\s+/).pop();
  const sugg = word ? [`“${word}”`, word, `${word}s`] : ['I', 'The', 'I’m'];

  const act = (fn) => (e) => {
    e.preventDefault();
    fn();
  };
  const typeKey = (k) => act(() => {
    onKey(shifted ? k.toUpperCase() : k);
    setShiftOnce(false);
  });

  const charKey = (k) => (
    <button key={k} type="button" className="key" data-k={shifted ? k.toUpperCase() : k} onPointerDown={typeKey(k)} tabIndex={-1}>
      {shifted ? k.toUpperCase() : k}
    </button>
  );

  return (
    <div className={`kb kb-${theme} ${open ? 'open' : ''}`} onPointerDown={(e) => e.preventDefault()} onMouseDown={(e) => e.preventDefault()} aria-hidden={!open}>
      <div className="kb-bar">
        {sugg.map((s, i) => (
          <span key={i} className="kb-sug">{s}</span>
        ))}
      </div>

      <div className="kb-row kb-r1">{rows[0].map(charKey)}</div>
      <div className="kb-row kb-r2">{rows[1].map(charKey)}</div>
      <div className="kb-row kb-r3">
        <button type="button" className="key fn kb-wide" onPointerDown={act(() => (layout === 'letters' ? setShiftOnce((v) => !v) : null))} tabIndex={-1}>
          {layout === 'letters' ? <Shift on={shifted} /> : <span className="kb-fnlabel">#+=</span>}
        </button>
        <div className="kb-mid">{rows[2].map(charKey)}</div>
        <button type="button" className="key fn kb-wide" onPointerDown={act(onBackspace)} tabIndex={-1}>
          <Delete />
        </button>
      </div>
      <div className="kb-row kb-r4">
        <button type="button" className="key fn kb-side" onPointerDown={act(() => setLayout((l) => (l === 'letters' ? 'numbers' : 'letters')))} tabIndex={-1}>
          <span className="kb-fnlabel">{layout === 'letters' ? '123' : 'ABC'}</span>
        </button>
        <button type="button" className="key kb-space" onPointerDown={act(() => onKey(' '))} tabIndex={-1}>
          <span className="kb-fnlabel">space</span>
        </button>
        <button type="button" className="key fn kb-side kb-send" onPointerDown={act(onSend)} tabIndex={-1}>
          <span className="kb-fnlabel">send</span>
        </button>
      </div>

      <span className="kb-icon kb-globe"><Globe /></span>
      <span className="kb-icon kb-dictate"><Mic /></span>
    </div>
  );
}
