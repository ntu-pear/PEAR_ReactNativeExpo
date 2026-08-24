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

## 2026-08-25 web-main tablet behaviour (`emulator-5554`)

VPN on for `10.96.188.x`. Metro is **localhost via `adb reverse tcp:8081 tcp:8081`** — VPN does not replace that reverse; after a VPN reconnect the reverse list was empty and the tablet showed “Cannot connect to Metro” until reverse was reapplied, then Reload.

Same-scene PNGs under `docs/screenshots/2026-08-17_e2e_*.png` were overwritten. New: `2026-08-17_e2e_supervisor_add_exclusion.png`, `2026-08-17_e2e_supervisor_generate_schedule.png`.

| Scene | 25 Aug in-app |
| --- | --- |
| Supervisor Activity Overview (ALICE) | **Pass** — **26** named catalogue rows with Neutral fill (`Vital Check AM` Neutral, `tablet game` Like, `tee break` Dislike). Recs are **empty-state copy** (`No doctor recommendations for this patient.`) after treating staging’s empty-list 404 as []. **Add Exclusion** shown. Exclusions: 2 rows. |
| Supervisor Add Exclusion sheet | **Pass** — named activity picker, remarks, required start date, end date or Indefinite. Not submitted (no staging write). |
| Supervisor Manage Preferences | **Pass** — 26 named chips (2 Like / 22 Neutral / 2 Dislike). No empty pills. |
| Supervisor Config generate this week | **Pass (confirm only)** — Config tab now uses AuthContext `roleName` (JWT has no role). Tapping This Week showed `Schedule already exists, continue to generate?`; **No** so the live schedule was not regenerated. Next week / 2 weeks later still unwired. |
| Caregiver Overview (ALICE) | **Pass** — 26 Neutral-filled prefs; banner **recommendations, exclusions** (404 + 403); **no** Add Exclusion. Manage Preferences present. |
| Caregiver Manage / Edit Preferences | **Pass** — 26 named chips; edit modal lists catalogue names with Like / Neutral / Dislike radios. Cancelled without saving. |

Honest leftovers: caregiver recs/exclusions **403** (Activity Service role gates on `origin/staging`); User Service `origin/staging` still has **no** `/Notification` routes; generate was not executed against staging; **do not claim all E2E passed**.

## 2026-08-25 continued walkthrough + other-repo heads

Fetched remotes only (mobile stayed on `cornelius/api-migration`). Live tablet still talks to **deployed staging**, not local checkouts.

| Repo | Local HEAD | Newest remote used by the team |
| --- | --- | --- |
| PEAR_ReactNativeExpo | `cornelius/api-migration` | same branch |
| PEAR_WebFE | `FWAFE-30-Patient-Info-Tab-Improvement` (behind) | **`origin/main`** (2026-08-25, revert aggregated endpoints + FWAFE-36). Do not port FWAFE-30/32/33. |
| PEAR_activity_service | `main` (Mar) | **`origin/staging`** (2026-08-21). Recs GET doctor/supervisor only; exclusions GET supervisor only. Aggregated routes exist in git; **live staging 404s** `/aggregated/activity-preference-table/patient/1`. Empty recs = 404 `"No Centre Activity Recommendations found for Patient ID 1"`. |
| PEAR_patient_service | `staging` | `origin/staging` (2026-08-22) |
| PEAR_scheduler | `scheduler_prod` | **`origin/scheduler_staging`** (2026-08-23) — med week-end Friday fix, don’t overwrite past days on regenerate |
| PEAR_user_service | watchdog feature branch | **`origin/staging`** (2026-08-22) — **no Notification API** |
| PEAR_logging_service | `main` | `origin/staging` (2026-08-22) |

| Scene | Result |
| --- | --- |
| Supervisor routine / photos / notes / medication / see-med / schedule | **Pass** (ALICE). Routine empty copy is honest. See-med: SALBUTAMOL. |
| Supervisor notifications | **Pass (fail-visible)** — Unread/Read/Accept/Reject. Staging has no Notification routes → `Unable to retrieve api data. Try again? Or Relogin`. Opening this tab previously **killed the app** (NativeBase `position="fixed"` on `ErrorRetryApiCard` is invalid on Android; material top-tabs + Reanimated also threw `ViewManager for tag could not be found`). |
| Caregiver All Patients / ALICE profile / overview | **Pass** — 10 patients; banner `recommendations, exclusions`; 26 prefs; **no** Add Exclusion. |

Fixes applied this pass (uncommitted): lift Android tab bar above the system nav inset; replace notification pager with a static Unread/Read/Accept/Reject strip; NativeBase `position="fixed"` → flex box on `ErrorRetryApiCard`.

## How To Re-Run Validation

1. Connect to NTU/PEAR VPN.
2. Confirm staging User login returns 200.
3. `npx expo start --dev-client` + `adb reverse tcp:8081 tcp:8081` (dev) or install the release APK (no Metro).
4. Walk login → patients → profile → schedule → Activity Overview → notes/routine/photos → medication administer → notifications.
5. `adb logcat -s ReactNativeJS`.
