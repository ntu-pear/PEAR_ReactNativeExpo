# Meeting Minutes — 3 Aug 2026 (Cornelius / Mobile)

Paste-ready for the team minutes spreadsheet.

## Done

- Closed live host E2E for migrated caregiver/supervisor path with VPN + staging User login (patients, prefs, exclusions, routines, doctor notes, photos, schedule all 200); Activity Overview APIs included (recs patient path still 404 with list fallback).
- Switched User Service base back to staging after login recovered; documented prod fallback.
- Notifications: wired swipe-accept to `/Notification/Action` approve (same as approval screen); list response normalization + Jest adapters; soft-noted User Service OpenAPI has no notification routes (web Navbar still mock — fail visibly).
- Built and installed internal **release APK** (`assembleRelease`, `app-release.apk` ~30 MB) on tablet emulator without Metro; login screen smoke OK.
- Updated validation / inventory / APK docs on `cornelius/api-migration`.

## In progress

- Interim report prep (~24 Aug).
- Full manual UI tap-through on release APK after human login (adb typing still flaky for `@`/`.`/`!`).

## Next week (waiting on web)

- FWAFE-33 patient-schedule calendar polish (unmerged).
- FWAFE-32 medication expand-on-row-click UX (unmerged).
- Holidays; centre schedule calendar editor.
- Production-signed APK / store packaging if needed later.
