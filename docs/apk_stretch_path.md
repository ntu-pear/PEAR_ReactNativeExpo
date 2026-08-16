# APK Delivery Path

Status: **internal demo APK available locally** (rebuilt 2026-08-17). Teams “manual test order” upload is **not** done (skipped by Cornelius).

## Artifact

| Item | Value |
| --- | --- |
| Build | Local Gradle `assembleRelease` on `cornelius/api-migration` |
| Output | `android/app/build/outputs/apk/release/app-release.apk` (~30.3 MB, rebuilt 2026-08-17 02:59) |
| Package | `com.pearreactnativeexpo` |
| Signing | Debug keystore (internal tablet demo only — not Play Store) |
| Cleartext HTTP | Enabled for `10.96.188.x` staging hosts |

Do **not** commit the APK binary to git. Rebuild locally or share the file out-of-band.

## Tester install notes (for ~24 Aug Prof testing)

1. Connect to the **NTU / PEAR VPN**. The APK talks to staging hosts, not localhost.
2. Install the APK on a tablet or Android emulator (no Metro required):

```bat
cd PEAR_ReactNativeExpo
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
"%ANDROID_HOME%\platform-tools\adb" install -r android\app\build\outputs\apk\release\app-release.apk
```

3. Confirm package `com.pearreactnativeexpo` is installed. The build is **debug-signed**.
4. Log in as **Supervisor** (or Caregiver for preference update) against staging:
   - User: `http://10.96.188.185/api/v1`
   - Patient: `http://10.96.188.180/api/v1`
   - Activity: `http://10.96.188.186/api/v1`
   - Scheduler: `http://10.96.188.186:5679`
5. Smoke path: login → patients → one profile → Activity Overview → medication administer confirm.
6. Do **not** mix production User (`10.96.188.171:5678`) with staging Patient/Activity/Scheduler.

## Build steps

1. Ensure Android SDK path in `android/local.properties` (`sdk.dir=...`) or `ANDROID_HOME`.
2. From repo `android/`:

```bat
cd android
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
gradlew.bat assembleRelease
```

3. Install with adb as above.

## Validated

- **2026-08-03:** Release APK installed on `emulator-5554`; login screen without Metro.
- **2026-08-17:** Rebuild after Activity Overview caregiver gate + medication administer confirm. Host API refresh is recorded in `emulator_endpoint_validation.md` when VPN is up.

## Still out of scope

- Teams APK upload / “manual test order”
- Play Console / store submission
- Production signing key rotation
- Backend ownership of staging outages
