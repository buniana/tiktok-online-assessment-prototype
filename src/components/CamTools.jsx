// The capture-screen tool icons (drawn with SVG), shared by the camera screen and the filming screen.
// Every icon takes the centre it should be drawn at, in design px.
export const stroke = { fill: 'none', stroke: '#fff', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function Icon({ cx, cy, size = 46, children }) {
  return (
    <svg className="cam-ic" width={size} height={size} viewBox="0 0 38 38" style={{ left: cx - size / 2, top: cy - size / 2 }} {...stroke}>
      {children}
    </svg>
  );
}

export const Sparkle = ({ x, y, r }) => (
  <path d={`M${x} ${y - r}Q${x + r * 0.15} ${y - r * 0.15} ${x + r} ${y}Q${x + r * 0.15} ${y + r * 0.15} ${x} ${y + r}Q${x - r * 0.15} ${y + r * 0.15} ${x - r} ${y}Q${x - r * 0.15} ${y - r * 0.15} ${x} ${y - r}Z`} fill="#fff" stroke="none" />
);

export const FlipIcon = ({ cx, cy }) => (
  <Icon cx={cx} cy={cy} size={44}>
    <path d="M9.4 15.6A10.4 10.4 0 0 1 27 13.2" strokeWidth="2.9" />
    <path d="M28.6 22.4A10.4 10.4 0 0 1 11 24.8" strokeWidth="2.9" />
    <path d="M23.6 13.8h7.4l-3.7 5.9z" fill="#fff" strokeWidth="1.2" />
    <path d="M14.4 24.2H7l3.7-5.9z" fill="#fff" strokeWidth="1.2" />
  </Icon>
);

export const FlashIcon = ({ cx, cy }) => (
  <Icon cx={cx} cy={cy} size={37}>
    <path d="M21.5 6.5 9.5 21.5h7L14 32l12.5-16h-7.5l2.5-9.500Z" fill="#fff" strokeWidth="1.2" />
    <path d="M6.500 6.500l25 25" strokeWidth="3.2" stroke="#4a0d10" />
    <path d="M6.500 6.500l25 25" strokeWidth="2.2" />
  </Icon>
);

export const EffectsIcon = ({ cx, cy }) => (
  <Icon cx={cx} cy={cy} size={43}>
    <circle cx="16.5" cy="21" r="9.3" />
    <rect x="12.300" y="18" width="2.400" height="4.400" rx="0.6" fill="#fff" stroke="none" />
    <rect x="17.900" y="18" width="2.400" height="4.400" rx="0.6" fill="#fff" stroke="none" />
    <path d="M25.400 20.500A9.400 9.400 0 0 1 14 30.300" />
    <Sparkle x={27} y={10.500} r={5.200} />
  </Icon>
);

export const TimerIcon = ({ cx, cy }) => (
  <Icon cx={cx} cy={cy} size={40}>
    <path d="M19 6.800A12.600 12.600 0 1 1 7.400 14.500" strokeWidth="2.600" />
    <path d="M14.600 14.200l3.900 6.300 2.700-1.500z" fill="#fff" strokeWidth="1" />
    <circle cx="19.600" cy="21" r="2.300" fill="#fff" stroke="none" />
  </Icon>
);

export const LayoutIcon = ({ cx, cy }) => (
  <Icon cx={cx} cy={cy} size={38}>
    <rect x="6.500" y="6.500" width="25" height="25" rx="5.500" />
    <path d="M17.500 6.500v25M17.500 19h14" />
  </Icon>
);

export const BeautyIcon = ({ cx, cy }) => (
  <Icon cx={cx} cy={cy} size={46}>
    <circle cx="20" cy="12.500" r="4.700" />
    <path d="M9 31.500a11 11 0 0 1 17-9.400" />
    <Sparkle x={7.500} y={20.500} r={3.600} />
    <Sparkle x={30.500} y={7.500} r={3.600} />
    <circle cx="29.500" cy="29.500" r="6.800" fill="#fe2c55" stroke="none" />
    <path d="M26 29.700l2.600 2.600 4.300-4.900" strokeWidth="2" />
  </Icon>
);
