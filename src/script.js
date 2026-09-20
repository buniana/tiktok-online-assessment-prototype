// Copy follows Figma. Agreed fixes: "do you want" typo, proper opening quotes, "NEED" -> "need" for now
// (stress-word styling to be designed later), and a new title for shot 3 (placeholder, was a duplicate of shot 2).
// ?copy=figma renders the original Figma wording (used only to pixel-compare against the exports)
const FIGMA_COPY = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('copy') === 'figma';
const V1_SHOTS = FIGMA_COPY ? [
  { time: '0-4s', title: 'Wide shot of the waves rolling in', script: '”Wait, we NEED to talk about this beach.”' },
  { time: '4-9s', title: 'Walking toward the water, feet in frame', script: '”Like I genuinely stopped everything I was doing.”' },
  { time: '9-15s', title: 'Walking toward the water, feet in frame', script: '”Look. At. This. I\'m not even kidding right now.”' },
] : [
  { time: '0-4s', title: 'Wide shot of the waves rolling in', script: '“Wait, we need to talk about this beach.”' },
  { time: '4-9s', title: 'Walking toward the water, feet in frame', script: '“Like I genuinely stopped everything I was doing.”' },
  { time: '9-15s', title: 'Slow pan across the horizon', script: '“Look. At. This. I’m not even kidding right now.”' },
];

export const SCRIPT = {
  title: ['What do you want', 'to ', 'film', '?'],
  subtitle: 'Let’s plan your next trendy video together.',
  userTurns: [
    'Hi. I am at a beach and want to shoot a quick video about the ocean, the beach view',
    'I want the video to be more aesthetic.',
  ],
  aiQuestion: 'What video style do you want?',
  aiDone: 'Got it. I have everything I need.',
  listening: 'Listening',
  thinking: 'Thinking…',
  cta: 'Ready to film',
  inputPlaceholder: 'Type or speak',
};

// Placeholder "updated plan" shown after the user types a refinement (content is scripted, not generated).
// `hl` marks fields that changed so they can flash in the accent colour; `isNew` marks an added shot.
export const PLANS = [
  { intro: 'Here is a plan for your beach video:', title: 'Aesthetic Beach Shot Plan', shots: V1_SHOTS },
  {
    intro: 'Here is your updated plan:',
    title: 'Aesthetic Beach Shot Plan',
    shots: [
      V1_SHOTS[0],
      V1_SHOTS[1],
      { time: '9-13s', title: 'Slow pan across the golden horizon', script: V1_SHOTS[2].script, hl: ['time', 'title'] },
      { time: '13-15s', title: 'Turn back to camera and smile', script: '“Okay, best beach day ever.”', isNew: true },
    ],
  },
];
