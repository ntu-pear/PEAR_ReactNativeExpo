# APK Delivery Stretch Path

Status: **deferred** until after school reopens (per 6 Jul meeting guidance).

## Why deferred

Full APK packaging/signing is stretch work after core web-parity mobile flows are demoable on emulator. Interim report remains ~24 Aug.

## Prep already in place

- Branch: `cornelius/api-migration`
- Emulator package: `com.pearreactnativeexpo` (installed and launchable)
- Metro + `adb reverse tcp:8081 tcp:8081` for day-to-day validation
- Jest adapters for schedule parser + activity prefs/recs/exclusions

## When unblocking APK

1. Confirm VPN + staging User/Patient/Activity/Scheduler healthy.
2. Re-run E2E path in `docs/emulator_endpoint_validation.md`.
3. Build release APK from Expo/EAS or local Gradle release assemble.
4. Smoke-test install on a physical tablet without Metro.
5. Share APK + short install notes with the team.

## Out of scope until then

- Store submission / Play Console
- Production certificate rotation
- Backend ownership of staging outages
