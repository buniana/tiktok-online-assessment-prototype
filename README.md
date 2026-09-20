# TikTok AI planning prototype

An interactive prototype of a new AI-planning feature in TikTok's video-creation flow (React + Vite).

Camera screen → tap **PLAN** → voice-first AI chat → thinking → shot-list plan (you can also type changes) → **Ready to film** → filming flow (ready / recording / review per shot) → preview of the whole video.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173 (also reachable from other devices on your network)
npm run build    # production build in dist/ (a static site: host it anywhere)
```

## Handy details

- **Simulated sound input** is on by default, so the whole flow runs without a microphone (and never asks for one). Turn it off with `?sim=0`, the debug panel or the **S** key to use the real mic.
- **Debug panel:** shown while developing, hidden in the production build. Add `?debug=1` to any link to bring it back (`D` shows/hides it; the **S** key switches simulated sound).
- Made for a phone-shaped 440 × 956 stage that scales to fit any screen.
- Design decisions and measurements live in [`design.md`](design.md).

## Credits

- Font: TikTok Sans (SIL Open Font License, see `public/fonts/OFL.txt`).
- Filming backgrounds are free stock clips from [Pexels](https://www.pexels.com): Mohith Reddy (waves), Peggy Anke (feet in the surf), Trippy Clicker (sunset pan). They are placeholders until real footage is added.
