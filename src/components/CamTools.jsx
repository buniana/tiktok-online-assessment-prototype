// The capture-screen tool icons, shared by the camera screen and the filming screen. Every icon takes the centre it should be drawn at,
// in design px. They are redrawn from the original product (traced and fitted, see design.md): each has the original's width and
// height, the flip is two constant-width arcs with small arrowheads, the flash is the six-point bolt with its slash, the timer's dot and
// needle sit exactly on the dial's centre, and the effects icon has its second ring.
export const stroke = { fill: 'none', stroke: '#fff', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const FlipIcon = ({ cx, cy }) => (
  <svg className="cam-ic" width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ left: cx - 16, top: cy - 16 }}>
    <path d="M12.38 6.12Q12.09 5.37 12.84 5.11A12.03 12.03 0 0 1 28.43 16.6L25.87 16.6A9.47 9.47 0 0 0 13.76 7.5Q13.01 7.76 12.72 7.01Z" fill="#fff"/><path d="M24.05 16.6L30.25 16.6Q30.8 16.6 30.5 17.06L27.45 21.74Q27.15 22.2 26.85 21.74L23.8 17.06Q23.5 16.6 24.05 16.6Z" fill="#fff"/><g transform="rotate(180 16.4 16.6)"><path d="M12.38 6.12Q12.09 5.37 12.84 5.11A12.03 12.03 0 0 1 28.43 16.6L25.87 16.6A9.47 9.47 0 0 0 13.76 7.5Q13.01 7.76 12.72 7.01Z" fill="#fff"/><path d="M24.05 16.6L30.25 16.6Q30.8 16.6 30.5 17.06L27.45 21.74Q27.15 22.2 26.85 21.74L23.8 17.06Q23.5 16.6 24.05 16.6Z" fill="#fff"/></g>
  </svg>
);

export const FlashIcon = ({ cx, cy }) => (
  <svg className="cam-ic" width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ left: cx - 16, top: cy - 16 }}>
    <path d="M22.55 3.25L11.63 11.73L20.51 20.61L26.9 15.65L18.5 14.1Z" fill="#fff"/><path d="M9.97 13.02L4.9 16.95L13.3 18.5L9.25 29.35L18.85 21.9Z" fill="#fff"/><path d="M7.9 6.1L26.3 24.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
  </svg>
);

export const EffectsIcon = ({ cx, cy }) => (
  <svg className="cam-ic" width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ left: cx - 16, top: cy - 16 }}>
    <path d="M21.97 11.32A9.97 9.97 0 1 1 18.8 6.61L17.34 8.47A7.59 7.59 0 1 0 19.41 11.2Z" fill="#fff"/><rect x="13.9" y="10.8" width="2.4" height="4.2" rx="0.6" fill="#fff"/><rect x="8.6" y="10.8" width="2.4" height="4.2" rx="0.6" fill="#fff"/><path d="M27.53 13.41A9.71 9.71 0 0 1 13.31 26.48A1.38 1.38 0 0 1 15.85 25.43A7.27 7.27 0 0 0 25.88 15.41A1.29 1.29 0 0 1 27.53 13.41" fill="#fff"/><path d="M24.75 3.35Q25.52 7.73 29.9 8.5Q25.52 9.27 24.75 13.65Q23.98 9.27 19.6 8.5Q23.98 7.73 24.75 3.35Z" fill="#fff"/>
  </svg>
);

export const TimerIcon = ({ cx, cy }) => (
  <svg className="cam-ic" width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ left: cx - 16, top: cy - 16 }}>
    <path d="M11.1 5.02A11.69 11.69 0 1 1 5.16 11.2" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none"/><path d="M17.12 13.89L11.14 9.99A0.6 0.6 0 0 0 10.31 10.82L14.21 16.8A2.1 2.1 0 1 0 17.12 13.89Z" fill="#fff"/>
  </svg>
);

export const LayoutIcon = ({ cx, cy }) => (
  <svg className="cam-ic" width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ left: cx - 16, top: cy - 16 }}>
    <path fillRule="evenodd" d="M9.7 3.9H22.2A5.5 5.5 0 0 1 27.7 9.4V21.9A5.5 5.5 0 0 1 22.2 27.4H9.7A5.5 5.5 0 0 1 4.2 21.9V9.4A5.5 5.5 0 0 1 9.7 3.9ZM9 6.4H14.4A0.4 0.4 0 0 1 14.8 6.8V24.4A0.4 0.4 0 0 1 14.4 24.8H9A2.3 2.3 0 0 1 6.7 22.5V8.7A2.3 2.3 0 0 1 9 6.4ZM17.5 6.4H22.9A2.3 2.3 0 0 1 25.2 8.7V14.1A0.4 0.4 0 0 1 24.8 14.5H17.5A0.4 0.4 0 0 1 17.1 14.1V6.8A0.4 0.4 0 0 1 17.5 6.4ZM17.5 16.8H24.8A0.4 0.4 0 0 1 25.2 17.2V22.5A2.3 2.3 0 0 1 22.9 24.8H17.5A0.4 0.4 0 0 1 17.1 24.4V17.2A0.4 0.4 0 0 1 17.5 16.8Z" fill="#fff"/>
  </svg>
);

export const BeautyIcon = ({ cx, cy }) => (
  <svg className="cam-ic" width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ left: cx - 16, top: cy - 16 }}>
    <circle cx="15.95" cy="10.25" r="4.3" stroke="#fff" strokeWidth="2.3" fill="none"/><path d="M6.9 26.39A8.54 8.54 0 0 1 21.25 19.49A0.78 0.78 0 0 1 20.14 20.6A7.34 7.34 0 0 0 8.78 26.38Z" fill="#fff"/><path d="M25.2 3.2Q25.74 5.86 28.4 6.4Q25.74 6.94 25.2 9.6Q24.66 6.94 22 6.4Q24.66 5.86 25.2 3.2Z" fill="#fff"/><path d="M6.75 12.55Q7.29 15.16 9.9 15.7Q7.29 16.24 6.75 18.85Q6.21 16.24 3.6 15.7Q6.21 15.16 6.75 12.55Z" fill="#fff"/><circle cx="25.34" cy="25.03" r="6.45" fill="#FE2C55"/><path d="M22.6 25.1L24.6 27.2L28.3 22.2" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);
