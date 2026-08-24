# Emulator Endpoint Validation

Date: 2026-08-17 (updated)

## Environment

- Emulator: `emulator-5554` (`Medium_Tablet_API_33`)
- App package: `com.pearreactnativeexpo`
- Metro: `localhost:8081` with `adb reverse tcp:8081 tcp:8081` (dev-client)
- VPN required for `10.96.188.x` services

## Network Preflight (2026-08-17, VPN on)

| Check | Result |
| --- | --- |
| Staging User login (`10.96.188.185`) | **200** |
| Patient Service (`10.96.188.180`) | Reachable |
| Activity Service (`10.96.188.186`) | Reachable |
| Scheduler (`10.96.188.186:5679`) | **200** (`/docs`) |

## Host API walkthrough (2026-08-17, staging Supervisor token)

| Flow | Endpoint | Result |
| --- | --- | --- |
| Login | `POST /api/v1/login/` (staging) | **Pass — 200** |
| Patient list | `GET /patients/?skip=0&limit=2` | **Pass — 200** |
| Patient read | `GET /patients/1` | **Pass — 200** |
| Activity preferences | `GET /centre_activity_preferences/patient/1` | **Pass — 200** |
| Doctor recommendations (patient) | `GET /centre_activity_recommendations/patient/1` | **404** |
| Doctor recommendations (list fallback) | `GET /centre_activity_recommendations/` | **404** (Activity Overview now fails this section visibly) |
| Activity exclusions | `GET /centre_activity_exclusions/` | **Pass — 200** |
| Routines | `GET /routines/patient/1` | **Pass — 200** |
| Doctor notes | `GET /DoctorNote/GetDoctorNotesByPatient` | **Pass — 200** |
| Photo albums | `GET /PhotoListAlbum/get_photo_list_albums` | **Pass — 200** |
| Schedule read | `GET /schedule/getSchedule/` | **Pass — 200** |
| Medication schedule | `GET /MedicationSchedule/get/` | **Pass — 200** |
| Notifications | `GET /Notification/User` | **404** — path not in User Service OpenAPI (web Navbar still mock) |

Demo path covered at host level: login → patients → profile data → schedule → prefs/exclusions → notes/routine/photos → medication schedule. Recommendations list fallback is currently also 404.

Patient Service latest fetch (`origin/staging`) is guardian NRIC lookup / guardian cap — not a medication-administer API. Administer persist uses Scheduler.

## Host API walkthrough (2026-08-03, staging Supervisor token)

| Flow | Endpoint | Result |
| --- | --- | --- |
| Login | `POST /api/v1/login/` (staging) | **Pass — 200** |
| Patient list | `GET /patients/?skip=0&limit=2` | **Pass — 200** |
| Patient read | `GET /patients/1` | **Pass — 200** |
| Activity preferences | `GET /centre_activity_preferences/patient/1` | **Pass — 200** |
| Doctor recommendations | `GET /centre_activity_recommendations/patient/1` | **404** (list fallback in mobile API) |
| Activity exclusions | `GET /centre_activity_exclusions/` | **Pass — 200** |
| Routines | `GET /routines/patient/1` | **Pass — 200** |
| Doctor notes | `GET /DoctorNote/GetDoctorNotesByPatient` | **Pass — 200** |
| Photo albums | `GET /PhotoListAlbum/get_photo_list_albums` | **Pass — 200** |
| Schedule read | `GET /schedule/getSchedule/` | **Pass — 200** |
| Notifications | `GET /Notification/User` | **404** — path not in User Service OpenAPI (web Navbar still mock) |

## In-app emulator

| Step | 2026-08-03 | 2026-08-17 |
| --- | --- | --- |
| Emulator present | Pass | Pass (`emulator-5554`) |
| Metro / adb reverse | Pass | Not required for release APK |
| Full typed UI walkthrough | Host path green; adb typing flaky | Still needs a human login; host path revalidated |

## Notifications (2026-08-03)

- Mobile keeps legacy `/Notification/User` + `/Notification/Action` (same as prior mobile contract).
- User Service v1 OpenAPI has **no** notification routes; web FE Navbar uses local mock data — fail visibly, no silent mocks.
- Swipe-accept now calls `setNotificationAction(..., 'approve')` (parity with approval request screen).
- Jest adapters cover list normalization + approve action params.

## Deferred (web WIP / incomplete on main)

- Holidays, centre calendar editor
- FWAFE-33 patient-schedule calendar polish
- FWAFE-32 medication expand-on-row-click UX
- Game recommendations

## 2026-08-24 in-app tablet walkthrough (`emulator-5554`)

Debug APK + Metro (release `assembleRelease` still hangs on Metro `createBundleReleaseJsAndAssets`). Same-scene PNGs under `docs/screenshots/2026-08-17_e2e_*.png` were **overwritten** with 24 Aug captures.

| Scene | 24 Aug in-app |
| --- | --- |
| Supervisor patients / ALICE profile | **Pass** — `ALICE` / `ALICE LEE` |
| Activity Overview prefs | **Pass** — `ART & CRAFT AM` etc. Recs banner still **fail visible** (404) |
| Caregiver Overview | Prefs OK; banner **recommendations, exclusions** (404 + 403) |
| Preference / caregiver edit | **Pass** — named chips + edit radios |
| Schedule | **Pass** — `Free and Easy` / times, no raw JSON |
| See medication | **Pass** — SALBUTAMOL for ALICE LEE |
| Doctor notes / Photo album | **Pass** |
| Routine | **Empty (honest)** — GET no longer 400 after omitting `include_deleted=false`; ALICE has no rows (`No routines recorded for this patient.`) |
| Caregiver My Patients | **Pass** — 1 allocated (`TESTING GIDEON TAN`), not empty |
| Caregiver All Patients | **Pass** — 10 including ALICE |

Not a signed release APK. Recs 404 and caregiver exclusion 403 are staging/backend.

| Issue from 17 Aug in-app | Adapter change |
| --- | --- |
| Schedule cards showed raw JSON day maps | `parseScheduleDay` JSON.parses stringified `{ "09:00-09:30": "..." }` objects |
| `undefined undefined` under ALICE | `readPatientV1` / `getPatient` merge `normalizePatientV1` (`name` → first/preferred). Headers on Overview, Preference, Medication, Doctor Note, Schedule use `patientProfileLines` |
| Preference titles `Untitled Activity` | Screens fetch `getCentreActivities` + `getActivities`, then `buildActivityTitleMap` (untitled centre titles fall through to catalog). `getActivityPreference` itself still one GET so existing Jest stays valid |
| Routine screen blank / raw keys | Human columns Activity / Days / Start / End; empty copy via `noDataMessage`. GET `/routines/patient/:id` (no trailing slash) |
| Medication list empty / PascalCase crash | `/Medication/PatientMedication?pageNo=0` rows mapped to camelCase; empty catalog falls back to today's Scheduler slots |
| Caregiver My Patients empty | Allocation IDs compared as strings |
| Recs 404 / caregiver exclusions 403 | Still fail visibly after list fallback; Jest covers 404 and 403 fallback |

Recommendations remain 404 on live staging (patient path and list). Caregiver exclusion list remains 403 until backend grants read. Notifications remain 404.

## How To Re-Run Validation

1. Connect to NTU/PEAR VPN.
2. Confirm staging User login returns 200.
3. `npx expo start --dev-client` + `adb reverse tcp:8081 tcp:8081` (dev) or install the release APK (no Metro).
4. Walk login → patients → profile → schedule → Activity Overview → notes/routine/photos → medication administer → notifications.
5. `adb logcat -s ReactNativeJS`.
