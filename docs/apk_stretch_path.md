# APK Delivery Path

Status: **internal demo APK available** (2026-08-03).

## Artifact

| Item | Value |
| --- | --- |
| Build | Local Gradle `assembleRelease` on `cornelius/api-migration` |
| Output | `android/app/build/outputs/apk/release/app-release.apk` (~30 MB) |
| Package | `com.pearreactnativeexpo` |
| Signing | Debug keystore (internal tablet demo only — not Play Store) |
| Cleartext HTTP | Enabled for `10.96.188.x` staging hosts |

Do **not** commit the APK binary to git. Rebuild locally or share the file out-of-band.

## Build steps

1. Ensure Android SDK path in `android/local.properties` (`sdk.dir=...`) or `ANDROID_HOME`.
2. From repo root / android:

```bat
cd android
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
gradlew.bat assembleRelease
```

3. Install on emulator/tablet:

```bat
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

4. Smoke-test **without Metro**: login → patients → one profile card.

## Validated 2026-08-03

- Release APK installed on `emulator-5554` (`adb install -r` Success).
- App launches to PEAR login screen without Metro (screenshot `docs/screenshots/2026-08-03_release_apk.png`).
- Host API path for migrated flows validated with staging User login (see `emulator_endpoint_validation.md`).

## Still out of scope

- Play Console / store submission
- Production signing key rotation
- Backend ownership of staging outages
