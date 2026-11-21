# Nocturne — Truth or Dare · Spin the Bottle

Android package: `com.nosgamesp12.nocturne` (live on Play at versionCode 1 / versionName 1.0)

## What's in `www/`

| File | Purpose |
|------|---------|
| `index.html` | Screens: 18+ gate → setup (players + vibe) → game table + bottom sheet |
| `style.css` | House-party flyer theme: ultraviolet background, sticker panels (ink outline + hard shadow), the bottle spins on a vinyl record, confetti when it lands. Mobile-first, safe-area aware |
| `fonts/` | Lilita One + Figtree (woff2, SIL OFL licences included), bundled so the app works offline |
| `script.js` | Game logic: bottle spin, seat layout, truth/dare flow, skip penalties, scores |
| `questions.js` | Question deck (4 vibes × 15 truths + 15 dares) and penalties. `{player}` is replaced with another player's name |

To test, serve the folder (`npx serve www` or `python -m http.server` inside `www/`) and open it in a phone-sized browser window. Opening the file directly works too, but Chrome blocks local fonts over `file://`, so it'll fall back to system fonts.

## What changed from v1.0

- **Real spin-the-bottle**: players sit around a table and the bottle spins and points at someone (v1 spun a coloured wheel with a static bottle; wheel slices were broken for 2–3 players and the second spin could rotate backwards).
- **Player names** instead of "Player 1…", saved between sessions; 2–12 players.
- **Vibes picked once at setup** (Warm-up, Flirty, Spicy, Couples) instead of random categories each turn.
- **Flow**: chosen player → Truth / Dare / Surprise me → card → Done (+1 truth, +2 dare), New one, or Skip → penalty.
- **Questions bundled in `questions.js`**. v1 fetched `../nocturne_full_200.json`, which wasn't in the app bundle, so players only ever saw 12 fallback questions.
- No repeated prompts until a deck runs out; the same player is never picked twice in a row (3+ players).
- Fixed: literal `**TRUTH:**` showing on cards, "SPIN" text showing twice on the bottle, cap clipped off, a CSS `@import` that was being ignored, PASS doing nothing.
- 18+ gate on first launch, haptics on spin/land, scoreboard, Android back-button support (Cordova `backbutton` event).

## UX / accessibility pass (ui-ux-pro-max checklist)

- **Focus:** when a sheet opens, focus moves into it (Truth, then the card text, the forfeit, or Keep playing) and the table behind is `inert`. When it closes, focus returns to the bottle. Each screen change focuses that screen's heading.
- **Contrast:** all body text is ≥ 4.5:1. Dare red darkened to `#AD2536` (bone text 5.4:1). Input, secondary button and switch outlines are `#7E6662` (3.4:1).
- **Touch:** every control is ≥ 48dp. `touch-action: manipulation` on buttons. Each action only fires from its own step, so double-tapping Done counts once.
- **Back:** the on-screen back button, Esc and the Android back button all share one path. Card goes back to Truth/Dare, forfeit goes to the next spin, and the table asks "Leave this game?" before scores reset. While a game is running the app holds one history entry, so Capacitor's default WebView back works without the App plugin.
- **Motion:** the phone's reduced-motion setting gives a 0.5s spin with no extra turns and no tick vibrations, and turns off all CSS transitions. The sheet slides out faster than it slides in.
- **Forms:** the name field has a visible label, and errors (duplicate name, table full) appear under the field (`aria-describedby`, `aria-invalid`). Removing a player shows an Undo toast.
- **Screen readers:** the spin result and points go to a live region. The sheet's dialog label follows the current step.
- **Layout:** landscape phones get a smaller table and a scrollable sheet. Still, lock the Android activity to portrait (`android:screenOrientation="portrait"`) since the game is designed for it.

## Android app

The `android/` folder is a Capacitor 8 project (`com.nosgamesp12.nocturne`, versionCode 2 / 1.1, target SDK 36, portrait).

- `npm install`, then `npx cap sync android`, copies `www/` into the app
- GitHub Actions (`.github/workflows/android.yml`) builds a test APK and the signed release `.aab`
- **To publish the update, follow [RELEASE.md](RELEASE.md).**
