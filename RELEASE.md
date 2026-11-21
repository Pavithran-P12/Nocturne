# Releasing Nocturne 1.1 to Google Play

The app is `com.nosgamesp12.nocturne`. This build is **versionCode 2 / version 1.1**, targets **Android 16 (API 36)**, and is built by GitHub Actions. You don't need Android Studio.

Play only accepts the update if the `.aab` is signed with the **upload key** registered for this app. Sort that out first.

---

## Step 1: find out which upload key Play expects

1. Open [Play Console](https://play.google.com/console) and pick **Nocturne**.
2. Go to **Protected with Play → Play Store protection → Manage Play app signing**. You can also type "app signing" into the Play Console search bar.
3. In **Upload key certificate**, note the **SHA-1** fingerprint.

Then look on your PC for the keystore you used for version 1.0:

- In File Explorer, search your user folder for `*.jks` and `*.keystore`.
- Check wherever the 1.0 build was made (another PC, a website-to-APK builder, a friend's machine…).

**To check whether a file is the right key:** copy it into the `Nocturne` folder (it's git-ignored, so it won't be committed) and ask Claude to check its fingerprint. Or, if you have Java: `keytool -list -v -keystore yourfile.jks` and compare the SHA-1 with Play Console.

| What you found | What to do |
|---|---|
| A keystore whose SHA-1 matches, and you know the passwords | Go to Step 2 |
| No keystore, or forgotten passwords | **Reset the upload key** (below) |
| Play Console shows no "Upload key certificate", only an app signing key you manage yourself | You need that exact key. Without it, the update can't be published |

### Reset a lost upload key

1. Create a new upload key. Claude can generate `upload-keystore.jks` and `upload_certificate.pem` into this folder for you. Or with Java:
   ```
   keytool -genkeypair -v -keystore upload-keystore.jks -alias upload -keyalg RSA -keysize 4096 -validity 10000
   keytool -export -rfc -keystore upload-keystore.jks -alias upload -file upload_certificate.pem
   ```
2. On the Play app signing page, under **Upload key certificate**, click **Request upload key reset**. Give a reason, upload `upload_certificate.pem`, and click **Request**.
3. Wait for Google's approval email. It usually takes a few days, and the new key only works from the date in the email.
4. **Back up `upload-keystore.jks` and its password** in a password manager or private cloud storage. Losing it again means another reset.

---

## Step 2: give GitHub the key (once)

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**. Add four secrets:

| Name | Value |
|---|---|
| `NOCTURNE_KEYSTORE_BASE64` | The keystore file as base64 (see below) |
| `NOCTURNE_KEYSTORE_PASSWORD` | Keystore password |
| `NOCTURNE_KEY_ALIAS` | Key alias (e.g. `upload`) |
| `NOCTURNE_KEY_PASSWORD` | Key password (often the same as the keystore password) |

To get the base64 text on Windows, run this in PowerShell from the folder with the keystore. It copies the text to your clipboard:
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$PWD\upload-keystore.jks")) | Set-Clipboard
```

GitHub stores secrets encrypted and never shows them in logs.

---

## Step 3: build

Push to `main`, or go to **Actions → Android build → Run workflow**. After about 5 minutes, open the run and download:

- **nocturne-debug-apk**: install on your phone to test (see Step 4).
- **nocturne-release-for-play-console**: contains `app-release.aab` (upload this) and a signed `app-release.apk`.

The log step **"Show which key signed the release"** prints the SHA-1. It must match the upload key certificate in Play Console.

---

## Step 4: test on your phone

1. Uninstall the Play Store version of Nocturne first. Android won't install a differently signed copy over it.
2. Copy `app-debug.apk` to your phone and open it. Allow "Install unknown apps" for your file manager if asked.
3. Check: the 18+ screen, adding players, spinning, Truth/Dare, skip and forfeit, scores, the Android back button (it should ask "Leave this game?" mid-game and close the app from setup), and that nothing sits under the status bar or the gesture bar.

---

## Step 5: publish in Play Console

1. **Test and release → Production → Create new release.** Internal testing first is a good idea.
2. Upload `app-release.aab`. Play checks the signature, the version code (must be > 1) and the target API (36).
3. Release notes, for example:
   > New look! Spin the bottle on a party deck, add your friends by name, pick your vibe (Warm-up, Flirty, Spicy, Couples), and keep score. 120 new truths and dares.
4. Before rolling out, review **Policy and programs → App content**:
   - **Content rating:** retake the questionnaire. The game has sexual innuendo/suggestive themes and mentions alcohol (forfeits mention "a sip of your drink").
   - **Target audience:** 18 and over only.
   - **Data safety:** the app collects and shares no data. Player names stay on the device (local storage only) and there's no network access.
   - **Ads:** no ads.
5. Update the store listing screenshots to the new design. The 512×512 store icon is `assets/play-store-icon-512.png`.
6. **Send for review → Roll out.**

---

## Every future release

1. Edit the game in `www/`.
2. In `android/app/build.gradle`, raise `versionCode` by 1 and update `versionName`.
3. Push. GitHub builds the signed `.aab`. Upload it to Play.
