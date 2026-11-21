# Nocturne — notes for Claude

Truth-or-dare spin-the-bottle game. Web game in `www/` (plain HTML/CSS/JS, no bundler), wrapped for Android with Capacitor.

## Fixed facts (don't change)
- Android applicationId: `com.nosgamesp12.nocturne` (live on Google Play). Never change it.
- Every Play release needs a higher `versionCode` in `android/app/build.gradle` (1.0 = 1, 1.1 = 2, …).
- Play requires an `.aab`, signed with the registered upload key. The key never goes in git (see `.gitignore`, RELEASE.md).
- Target SDK must meet Google Play's current requirement (API 36 as of Aug 31 2026). Check Google's target API page before each release.

## Workflow
- Edit the game in `www/`, then `npx cap sync android` copies it into `android/app/src/main/assets/public`.
- CI: `.github/workflows/android.yml` builds a debug APK, plus a signed AAB when the keystore secrets are set.
- App icon/splash sources are in `assets/`. Android icons are full-bleed adaptive layers (108dp, 66% safe zone).

## Rules for new JS/npm work (standing user preference)
- Before adding or upgrading dependencies, look up current stable versions (npm registry / web). Never pin versions from memory.
- Pin exact versions in package.json and keep `engines.node` matching the framework's required Node version (Capacitor 8: Node >= 22).
- If a dependency needs install scripts (e.g. esbuild, sharp), pre-configure the npm install-script allowlist so installs don't warn.
- Check the framework's latest upgrade/migration guide for breaking defaults before shipping.

## Design
House-party flyer: ultraviolet `#3B1FD1`, ink `#1A0B3D` outlines with hard offset shadows, pink `#FF3EA5`, lime `#C6FF3D`, yellow `#FFD23F`, cream `#FFF7E8`. Display font Lilita One, body Figtree (bundled in `www/fonts`). Keep contrast ≥ 4.5:1 for text, touch targets ≥ 48dp.
