# TikTok AI Planning Feature — Design Spec

Source: [Figma — Frame 33](https://www.figma.com/design/J6mHTV654s91Ptc9CCn3RA/Untitled?node-id=58-1389) (all current frames live inside `Frame 33`; earlier top-level frames outside it are outdated).

This doc captures the design system extracted directly from Figma (colors, type, spacing, component anatomy) plus the flow we're building first. It's the reference for both of us while the prototype comes together — flag anything that looks off.

## 1. Flow scope (this build)

```
Camera capture screen (existing TikTok UI)
   → tap "PLAN" (new, next to "POST")
   → Voice-first AI chat (full-screen takeover)
       - always-listening for first question
       - tap-to-speak for follow-ups
       - captions of AI questions + transcribed user speech as chat bubbles
       - "Thinking..." state once enough info is gathered
   → Plan screen (same chat surface, header becomes "PLAN")
       - shows generated shot list
       - persistent "Type or speak" input to keep refining
       - "Ready to film →" CTA
   → (out of scope for this pass) Filming flow
```

All 7+ states we found under `Plan with AI Chat` in Figma map to this single logical screen at different moments — it's one continuous surface, not separate pages, so we should build it as one component with animated internal state changes rather than route transitions.

## 2. Entry point

- Lives on the **existing standard camera capture screen** (Figma layer `Upload flow` → `Start record segment 1`).
- Existing `POST` label stays as-is (it's part of the current TikTok UI).
- New `PLAN` text sits immediately to its right, bottom bar, same row.
  - Font: TikTok Sans SemiBold, 15px
  - Color: `#999999` (inactive gray — matches unselected-tab styling elsewhere in TikTok)
  - No pill/background — plain text label, same treatment as `POST`
- Tapping `PLAN` triggers a **full-screen takeover** into the voice-first chat (confirmed).

## 3. Voice-first chat screen

Full-bleed, pure black background (`#000000`).

**Header block**
- Title: "What do you want to **shoot**?" — TikTok Sans **Bold, 36px**, white, with the last word in accent cyan `#00D0D5`
- Subtitle: "Let's plan your next trendy video together." — TikTok Sans **SemiBold, 20px**, white
- Gap between title block and subtitle: 12px (auto-layout)

**Conversation**
- User (transcribed speech) → chat bubble, right-aligned
  - Fill: white at **12–13% opacity** (translucent "glass" look over black)
  - Corner radius: 20px
  - Padding: 16px horizontal / 18px vertical (approx, auto-layout)
  - Text: TikTok Sans **Regular, 16px**, white 100%
- AI (question / status text) → plain text, no bubble, left-aligned
  - TikTok Sans **SemiBold, 20px**, white 100%
  - Examples: "What video style do you want?", "Got it. I have everything I need."
- "Thinking" state: small TikTok logo glyph + "Thinking…" label while plan is generated

**Voice input control** (bottom-center) — this is the key interactive element

Two states, same footprint:

1. **Idle / tap-to-speak** — circular button
   - Outer gradient ring: two overlapping ellipses
     - Ring layer A: 80×80, solid `#00D0D5` (cyan)
     - Ring layer B: 77×77, linear gradient `#FE2C55 → #B4A5D9` (pink → lavender), layered on top so both colors show around the ring
   - Inner circle: 74×74, solid white, sits on top leaving a ~2–3px gradient ring visible
   - Mic glyph: dark navy/black, centered, ~12×21
   - This is a **static** button when idle — no animation until pressed/listening starts

2. **Active / listening** — waveform bar (replaces the circular button while capturing audio)
   - This is the element the brief specifically calls out: **soft blurred glow (background) + a smaller crisp waveform (foreground), no connected "line" look**
   - Layer stack (back to front):
     - Two blurred ellipses, 185×15 each, fill `#C4F4F5` at 58% opacity, one anchored left, one right of center, heavy layer-blur — this is the soft ambient glow
     - A blurred white vector (443×21, white fill, layer-blur) — soft highlight/core glow beneath the wave
     - The actual waveform shape: a filled vector + stroked vector, both using the **brand gradient**, ~444×33–39
   - **Brand gradient** (used here and for the mic ring): `#00D0D5 → #B4A5D9 → #FE2C55` (cyan → lavender → pink/red), stops at 0% / 51% / 100%
   - Behavior to build: amplitude of the crisp waveform reacts to live mic input (Web Audio API analyser); the blurred glow pulses more slowly/softly under it for the "aesthetic ambient" effect — glow should feel like it's underneath and reactive but smoothed, not 1:1 with the sharp wave

## 4. Plan screen (same surface, header becomes "PLAN")

- Header: back chevron (white) + centered "PLAN" title (bold, white — exact size TBD, treat as ~18–20px Bold pending confirmation)
- Prior conversation collapses to a compact bubble/log above the plan
- Section label: "Here is a plan for your beach video:" — plain white text
- Plan title: "Aesthetic Beach Shot Plan" — bold, larger (appears ~24–28px bold white, treat as Bold 24 pending confirmation)
- **Shot cards** (repeated, one per beat):
  - Container: white @ 13% opacity fill, corner radius 20, padding 8, vertical stack, gap ~8 between cards
  - Left accent bar: thin colored (red/pink) vertical line on the card's leading edge
  - Heading line: "0-4s" + description ("Wide shot of the waves rolling in") — TikTok Sans **Bold, 20px**, white (same text block)
  - Body: "**Script:** \"...\"" — TikTok Sans 16px, white, mixed weight (label bold-ish, quote regular)
- **CTA button** "Ready to film →"
  - Fill: `#FE2C55` (brand pink/red), corner radius 178 (full pill)
  - Padding: 18px horizontal / 6px vertical, 4px gap between label and arrow icon
  - Label: TikTok Sans **SemiBold, 16px**, white
- **Persistent input bar** ("Type or speak")
  - Pill shape, thin gradient border (brand gradient), dark fill
  - Left: "+" icon, center: placeholder text, right: mic icon
  - Lets the user keep refining the plan via voice or text before confirming

## 5. Design tokens summary

| Token | Value |
|---|---|
| Background | `#000000` |
| Accent cyan | `#00D0D5` |
| Accent lavender | `#B4A5D9` |
| Accent pink/red (brand CTA) | `#FE2C55` |
| Brand gradient | `linear-gradient(#00D0D5 0%, #B4A5D9 51%, #FE2C55 100%)` |
| Chat bubble fill | `rgba(255,255,255,0.12–0.13)` |
| Entry-point inactive label | `#999999` |
| Font family | **TikTok Sans** (see note below) |
| Heading | Bold 36 |
| Subheading / AI text | SemiBold 20 |
| Body / user bubble | Regular 16 |
| Small label (entry point) | SemiBold 15 |
| Card corner radius | 20px |
| CTA pill radius | 178px (full pill) |
| Device frame | **440×956** (Figma frame size; scaled to fit the browser) |

**Font note:** TikTok Sans (OFL-licensed variable font, supplied by you) is bundled in `public/fonts/`. Figma sets the optical-size axis equal to the font size — verified by measuring "Ready to film" (SemiBold 16 → 101px in Figma, 100.7px in the browser with automatic optical sizing). Natural line height is 1.3× font size.

## 6. Interaction & animation notes

- Entry → voice screen: **full-screen takeover** (confirmed) — should feel like the existing "open camera"-style transition: fast fade/slide, not bouncy.
- First voice turn: **always-listening**, mic auto-detects speech start/stop.
- Follow-up turns: **tap-to-speak** — user taps the idle button to start capturing, taps again (or auto-stops on silence) to end.
- Idle mic button ↔ active waveform: morph between the two, not a hard cut — the circle should smoothly expand/reshape into the bar.
- New chat bubbles slide/fade in as they arrive; AI text appears with a light fade (simulating "speaking").
- Transition from chat → plan: this is one continuous surface — the header swaps to "PLAN", conversation compresses, and the plan content animates in below. Avoid a jarring full re-mount.
- All transitions: smooth but snappy — nothing over ~300–400ms, no heavy bounce/spring overshoot per your "smooth but not too jarring" note.

## 7. Build plan for this pass

- **Stack:** React + Vite
- **Viewport:** iPhone frame, 390×844, rendered in the browser pane
- **Voice simulation:** real microphone input (Web Audio API `AnalyserNode`) drives the waveform amplitude for a convincing demo; no real speech-to-text — conversation content is scripted/typed via a dev input per your call ("fake voice input, real text plan")
- **Scope:** entry point → voice chat → plan screen → "Ready to film" tap (stub for filming flow, not built yet)

## 8. Decisions since the first draft

- Font: TikTok Sans files provided and bundled (no fallback needed).
- Debug panel: built, visible by default, hide with the button or the **D** key.
- Header sizes: "PLAN" 24 Bold and "Aesthetic Beach Shot Plan" 24 Bold are still estimates pending exported frames.

## 9. Measured layout (Figma → prototype, all in 440×956 design px)

| Element | Value |
|---|---|
| Hero title / subtitle | x 24, y 106, width 392, gap 12 (subtitle is 391.7px wide at 20px SemiBold, single line) |
| First user bubble | x 119, y 280, width 297 (right margin 24), padding 16 / 18, radius 20, fill white 12% |
| AI question (voice screen) | y ≈ 384, SemiBold 20 |
| "Got it" line | y ≈ 716, above the mic |
| Mic orb | white 74 @ (182,767); pink→lavender ring 77 @ (177,767); cyan ring 80 @ (183,764); mic glyph 36 @ (202,786) |
| Wave centre line | y ≈ 811; left lens centred x ≈ 180, right lens x ≈ 326 |
| Camera screen | record button 86 @ (177,743); POST centred x 220, PLAN centred x 288, both y ≈ 888 |
| Ready-to-film pill | 167×38, radius 178, padding 18 / 6, gap 4 |
| Shot card | width 392, padding 8, radius 20, fill white 13%, 8px gap between cards |
| Plan header | "PLAN" centred at y ≈ 79, hairline at y ≈ 114, first bubble ≈ 22px below it |
| Input pill | centred at y ≈ 868 (exact width/height pending reference export) |

Values marked "≈" were read off screenshots; they are the first things to verify against exported frames.

## 10. Agreed decisions (after first review)

- **Wave:** a permanent **6px** gradient line spans the full width. While the user speaks, the lens-shaped sound swell (Figma style: gradient outline, white core, soft glow) is born at the **right edge and travels left**, dissolving before the far edge. Extra "futuristic" layer: braided strands inside the swell, sparks at loud moments, a glowing emitter on the right edge, and a gleam sliding along the line at rest.
- **Live transcript bubble:** hovers above the wave while speaking (words reveal as they talk), then glides up into the chat column.
- **Thinking:** "Thinking..." letters (and the TikTok glyph) hop up and down in sequence.
- **Typing:** tapping "Type or speak" opens a phone-style keyboard inside the device; the pill rides above it and the chat shrinks to fit. Send appends a bubble. Dark keyboard by default (toggle in debug).
- **Copy fixes:** "do you want" typo, proper “ ” quotes, "NEED" → "need" (stress-word styling to be designed later), shot 3 title changed to "Slow pan across the horizon" (placeholder).
- **AI voice (TTS):** off by default, toggle in debug.

## 11. Pixel comparison against your exports (reference/)

All 12 frames you exported are in `reference/`. I render the prototype at their scale (Playwright, 440×956 @ 2.0932) and diff text rows, bubbles, cards and the pill against them. Current state: every measured text row is within ~1px vertically and 0.5px horizontally (voice states, thinking, plan); the camera screen and status bar are your export (pixel-identical).

Things the exports showed that I had wrong, now fixed:
- Bubble: padding 13px/16px, line-height 1.3 (not 18px padding).
- Plan cards have **no background** (only the 2px pink bar); 30px between cards; script text sits ~8.5px under the heading.
- Plan title is **SemiBold 24**; "Thinking…" uses a single ellipsis character and a 21px TikTok note.
- Hero sits **90px lower** until the first message lands.
- The AI question waits **above the mic**, then glides up into the chat column when the user starts answering; "Got it" sits there too.
- Header ends at y=112, "PLAN" centred at y=80. No home indicator anywhere in the exports, so none is drawn.
- Input pill: white 379×47 with cyan (right/top) and pink-purple (left/bottom) offsets, measured exactly.

Debug aid: add `?copy=figma` to the URL to render the original Figma wording (used only for the comparison; the agreed copy fixes are the default).

## 12. Behaviours added in review

- Words arriving while speaking: **pink → blue → white with TikTok red/blue shadow → plain white**.
- Orb ⇄ line: line → orb (dots fly in from the edges and grow into the three circles) is the approved motion; orb → line is its exact reverse (mirrored easing, circles shrink to 14px dots that head to the edges while the line draws from the centre, starting slightly thicker and settling to 6px). "Listening…" sits below the line; the decorative shimmer was removed.
- Keyboard: opens with keys sliding up; pill, chat height and content move in lockstep with it (no lag). Dark/light "Liquid Glass"-style approximation; exact iOS 27 look pending a real screenshot.
- Typed message → user bubble → "Thinking…" → **updated plan appended** (changed fields flash cyan then settle to white; new shot draws in). Content is scripted placeholder; only the latest plan keeps "Ready to film".

- First page (camera): drawn with SVG/CSS and laid out from measurements of your export (no image crops). Thumbnails and the gallery thumb are CSS gradients only — **never use the designer's own photos for them**. Only "PLAN" is new and tappable; the tap-hint hand can be hidden in the debug panel.
- Status bar is cropped from your export (pixel-identical) and reused on every screen; it is the only image asset besides the filming clips below.
- Voice wave height: everything drawn on the wave (white body, cyan/pink fringes, emitter, sparks) stays within **39px total** (±19.5 from the line). The white body's max half-height is 14.5 (`MAXH`); `BAND` = 19.5 clamps the sparks. Was 44px body / ~55px with fringes / ~57px measured before.
- "Listening…" is solid white, 20px / 600, with the top of its text box **32px below the centre of the line**. The whole label breathes very gently (4s cycle, opacity 0.72 ↔ 1, scale 0.99 ↔ 1.01), and the three dots wave on top with the same up-and-down as "Thinking…" (same `hop` keyframes, slower: 2s cycle, 250ms apart, so two waves per breath).
- Live words while speaking (smoother): reveal keeps flowing through pauses and the end-of-speech wait at a slower rate (3.2 → 2.2 words/s) instead of freezing; the final catch-up eases from ~400ms to ~230ms per word (floor scales down for long backlogs, always under ~2s) instead of a fixed 110ms burst; each word's pink → blue → shadow → white hand-off is now a short cross-fade with a quick fade-in (1s); the floating bubble glides up 0.45s when a line wraps (was 0.16s). Measured on the simulated turn: words animating at once 10 → 5, longest freeze 1.64s → 0.45s, fastest interval 106ms → 227ms.

## 13. Filming flow (frames 9-12 + later decisions)

**States, per shot:** **ready** (title "Segment N", the shot description, the teleprompter caption bubble, the record button, the right-hand toolbar) → **recording** (button becomes a stop button inside a translucent circle with the segmented progress ring; caption words turn cyan in order) → **review** (Retake / Next segment; on the last shot Retake / Finish). Close (X, top-left) returns to the plan exactly as it was; it stays mounted underneath.

**Segments:** one per shot of the plan being shown — **3** for the first plan, **4** for the updated plan. Each has its own stock clip behind it (Pexels licence, free to use; not the designer's photos): `public/video/segment-1.mp4` waves rolling in (Mohith Reddy), `segment-2.mp4` walking with feet in the surf (Peggy Anke), `segment-3.mp4` slow pan across a sunset sea (Trippy Clicker), all 720p vertical, normal speed. **Shot 4 of the updated plan reuses clip 3 as a stand-in** until a real clip is uploaded. The designer will upload more clips later (`CLIPS` in `FilmFlow.jsx`).

**Geometry (measured from the exports, ±0.5px):** panel top 74 / height 782 / radius 24; title 600 32px at ink left 41.6 / top 137.2; description 700 20px, 312px wide (wraps after "feet" for shot 2), ink top 179.2; caption bubble left 47.8, bottom 700.3, 352.5 wide, radius 24, 700 20px, text box 288px so it wraps before "this" (frame 9); caption has no quotation marks; record button 86px ring (3.2px) + 73px disc, both centred on (220, 786.1) and drawn as one SVG so they are exactly concentric; recording: translucent white circle 115.6px (59% white + blur), stop square 35px radius 8, ring stroke 7.4 at radius 55.5; Retake pill 24.4/868 174.4×37.8; Next pill 243.4/868 172.4×37.8; Finish pill 247.2/869.2 168.3×35.5; pill text 600 16px. The toolbar is the camera screen's icons (shared in `CamTools.jsx`) at the frames' 6 slots, with the same separator after the 2nd; hidden in review.

**Shadows on the filming screen (fitted to frames 9-12, each within ~1-2 levels of brightness):**
- **Top shadow** across the top of the filming panel: black, about **34% at the very top edge**, easing out (quadratic) to nothing by **~180dp** (the same 24%-of-panel reach as the camera screen's shadow). It is the same in every state (ready, recording, review) and sits over the video, under the UI. The strength assumes the sky in the frames is roughly uniform, so treat 34% as +/- a few percent.
- **Title and description text:** `text-shadow: 0 3px 8px rgba(0,0,0,.33)`. (An earlier version had a wider, softer shadow that was eyeballed; it did not match.)
- **Close (X) icon:** `drop-shadow(0 3px 6px rgba(0,0,0,.6))` (stronger and tighter than the text, because its strokes are thin).
- Not measured (no frame shows them): shadows on the right-hand toolbar icons and the caption bubble.

**Recording ring (segmented):** the ring is split into one arc per shot by white dividers (7.4 long, 1.2 thick, radial). The arc of the shot being filmed shows **faint pink** and fills to **solid pink** as you film; finished shots stay solid; shots still to come are empty. For 3 shots the dividers sit exactly where frame 10 has them (139.9° and 246.5°, so the arcs are 38.9% / 29.6% / 31.5%); for any other count the arcs are equal. Round ends at the start of the ring and on the moving head.

**Timing:** the fill runs on a timer over the shot length (0-4s = 4s, 4-9s = 5s, ...) and auto-stops, or the user taps stop early; the cyan caption highlight runs slightly ahead so every word is lit a little before the end.

**Review replays the take:** when a take finishes, the video restarts from the beginning and loops for exactly as long as the take was filmed (an early stop loops only that part), before moving on.

**Full preview:** Finish opens a preview of the whole video: every shot's take played back to back, one progress segment per shot (widths follow the take lengths), looping. X or Back returns to the last review; Done returns to the start. **The layout of this screen is a placeholder — there is no frame for it yet.**

**Other:** stress words stay lowercase ("need") until we design them. Update to the earlier filming-related notes: the small white marks in frames 10-12 are the ring's segment dividers (not artifacts).

## 14. Voice-turn detection and orb → line (later fixes)

- **Random pop-ups fixed:** a listening turn now starts only after about 0.4s of real speech (instant level, not the smoothed one; a quiet moment drains the counter at half speed), and a turn that ends up shorter than 0.8s is cancelled and its bubble removed, instead of hanging open. Reproduced before the fix: a 300ms noise ran the whole turn and the AI asked its question at ~8s. After: a 300ms blip does nothing, a 500ms noise flashes a bubble that removes itself, real speech works. Anything over ~0.8s of loud sound still counts as speech (no speech recognition to tell them apart).
- **Orb → line is now the exact reverse of line → orb**, property by property: every curve mirrored (`E = cubic-bezier(.32,.72,0,1)` → `(1,0,.68,.28)`; `ease` → `(.75,0,.75,.9)`) and each part delayed so it finishes with the 0.58s geometry (layer and mic fade `.24s` delay, mic scale `.08s`, wave fade `.28s`, wave stretch `-.12s`). The "Listening…" label is mirrored too (it leaves in the first .35s of line → orb, so it now arrives during the last .35s of orb → line instead of after a fixed .6s delay). Verified by seeking both animations to mirrored times (line → orb at s, orb → line at .58 − s): the dock region is identical, mean difference 0.00 / 255 at every step from 0 to .58s.
- **Simulated sound input (on by default):** each time the app starts listening it "speaks" the scripted line by itself (starts 0.7s after turn 1 begins, 0.45s after tapping the orb for turn 2; lasts about as long as the words take to say at ~3.2 words/s, at least 1.6s), then goes quiet so the turn ends on its own. Tapping the wave still ends a turn early. Switch it in the debug panel (Microphone section) or with the **S** key (small toast confirms; ignored with Cmd/Ctrl/Alt); the choice is remembered in the browser. `?sim=0` / `?sim=1` in the URL override it (used by the test scripts, which need scripted timing). **While it is on the real microphone is never asked for** (no browser permission prompt); it is requested only when simulated sound is off, turning simulated sound on lets go of a running mic, and the panel's "Enable mic" button still turns it on by hand. The one-shot "Simulate speech" button remains for extra control.

## 15. Sharing and phone preview

- **Not deployed yet** (2026-09-20: designer is not ready to submit). It is a static site with no backend: `npm run build` makes `dist/` (about 26 MB: three clips 7.2 + 9.3 + 9.3 MB, font 0.8 MB, code 0.3 MB). Asset paths assume the site is served from the **root** of a domain (Netlify / Vercel / Cloudflare Pages are fine; GitHub Pages project sites, which live under `/repo-name/`, would need a `base` setting and small path changes). `reference/` (the designer's exports) is not part of the build; the status-bar crop is the only image from them that ships.
- **The production build is clean by default:** no debug panel, no "Debug" button, no D / S keys. Add `?debug=1` to a link to get them. Development is unchanged (`?debug=0` only starts the panel closed). Dev tools never show on narrow screens.
- **Phones:** the dev server already listens on the network (`host: true`), so on the same Wi-Fi open the "Network" address Vite prints (e.g. `http://192.168.12.2:5173`). Plain http means the phone browser blocks the real microphone, which is why simulated sound input is on by default. On phones the prototype fills the screen edge to edge, the phone's own keyboard is kept off (`inputmode="none"`; the prototype draws its own), and double-tap zoom / rubber-banding / tap flashes are off. Verified on an emulated iPhone-sized touch screen (full flow by touch), not on a physical phone.
- **Microphone permission:** decided — with simulated sound on (the default, so the shared link too) the app never asks for the real microphone; reviewers see no permission prompt.
- **Made to work on any device (2026-09-20, decision: a normal public link, no QR / LAN tricks):** the record button's ring-and-disc morph is animated in JS (`useTween` in `FilmFlow.jsx`, same easing) instead of CSS geometry properties on SVG shapes, which Safari / Firefox may not animate; muted video autoplay is forced by hand (`kick`) because iOS Safari is strict; the three clips are H.264 + AAC with the index up front, so they start playing while downloading in every browser. Checked on desktop Chrome and an emulated iPhone-sized touch screen only (no real Safari / Firefox / Android available here).
- **To publish:** the designer needs an account on a static host; the assistant does not create accounts or sign in, and does not publish without an explicit go-ahead. Easiest: build (`npm run build`), then drag the `dist/` folder onto Netlify Drop (https://app.netlify.com/drop, free account) and rename the site. Alternatives: Vercel or Cloudflare Pages (one CLI command after a one-time browser login). Rebuild before every deploy, since `dist/` is a snapshot.

