# Emulator Endpoint Validation

Date: 2026-07-20 (updated, VPN on)

## Environment

- Emulator: `emulator-5554` (`Medium_Tablet_API_33`)
- App package: `com.pearreactnativeexpo` (installed; MainActivity focused)
- Metro: `localhost:8081` with `adb reverse tcp:8081 tcp:8081` (dev-client)
- VPN required for `10.96.188.x` services

## Network Preflight

| Check | 2026-06-21 (no VPN) | 2026-06-27 (VPN on) | 2026-07-06 (VPN on) | 2026-07-20 (VPN off) | 2026-07-20 (VPN on) |
| --- | --- | --- | --- | --- | --- |
| Host TCP to User Service (`10.96.188.185:80`) | Failed | Passed | **502** | Timed out | Reachable — login **HTTP 500** |
| Host TCP to Patient Service (`10.96.188.180:80`) | Failed | Passed | Reachable (401) | Timed out | Reachable (401 without token) |
| Host TCP to Activity Service (`10.96.188.186:80`) | Failed | Passed | Reachable (401) | Timed out | Reachable (401 without token) |
| Host TCP to Scheduler (`10.96.188.186:5679`) | Failed | Passed | **200** | Timed out | **200** |
| Prod User Service login (`10.96.188.171:5678`) | — | — | **200** | — | **200** (used for token) |

Soft note: staging User Service login currently returns HTTP 500 with empty body. Other staging services accept a prod-issued bearer token. Mobile `V1_BASE` temporarily points at prod User Service so emulator login can succeed when Metro is healthy. Treat as environment availability — not an app regression.

## Host API walkthrough (2026-07-20, VPN on)

Authenticated with Supervisor e2e account (`jess@gmail.com`) via prod User Service; then called staging Patient / Activity / Scheduler.

| Flow | Service | Endpoint | Result |
| --- | --- | --- | --- |
| Login | User (prod) | `POST /api/v1/login/` | **Pass — 200** |
| Login | User (staging `.185`) | `POST /api/v1/login/` | **Blocked — HTTP 500** |
| Patient list | Patient | `GET /patients/?skip=0&limit=2` | **Pass — 200** (e.g. ALICE LEE) |
| Patient read | Patient | `GET /patients/1` | **Pass — 200** |
| Activity preferences | Activity | `GET /centre_activity_preferences/patient/1` | **Pass — 200** |
| Doctor recommendations | Activity | `GET /centre_activity_recommendations/patient/1` | **404** (empty / path not populated on staging) |
| Activity exclusions | Activity | `GET /centre_activity_exclusions/` (+ patient filter) | **Pass — 200** (patient path 404 → list fallback) |
| Routines | Activity | `GET /routines/patient/1` | **Pass — 200** |
| Doctor notes | Patient | `GET /DoctorNote/GetDoctorNotesByPatient` | **Pass — 200** |
| Photo albums | Patient | `GET /PhotoListAlbum/get_photo_list_albums` | **Pass — 200** |
| Schedule read | Scheduler | `GET /schedule/getSchedule/` | **Pass — 200** — day fields are JSON object strings (`{"09:00-09:30":"..."}`); `parseScheduleDay()` covers this |

## In-app emulator (2026-07-20)

| Step | Result |
| --- | --- |
| Emulator present | Pass |
| App installed / launch | Pass |
| Metro status (`/status`) | Pass |
| Dev-client JS load | **Blocked this session** — app stuck on “Loading from localhost:8081…”; host bundle request also timed out under VPN/dev-client; screenshot: `docs/screenshots/2026-07-20_after_reload.png` |
| Login → patients → profile → schedule → Activity Overview → notes/routine/photos | **Deferred to next Metro-healthy run** — host path above already green except staging login + recommendations patient path |

Target demo path when Metro connects:

1. Login (Supervisor or Caregiver) via prod User Service workaround
2. Highlights / Dashboard
3. Patients → patient profile
4. Patient schedule (v1 JSON day parser)
5. Activity Overview — Preferences / Doctor Recommendations / Exclusions
6. Notes, Routine, Photos

## Fixes landed on `cornelius/api-migration`

| Change | Commit |
| --- | --- |
| Scheduler `parseScheduleDay()` for v1 JSON day maps | `965e629` |
| Tablet Activity Overview (prefs / recs / exclusions) + APIs + Jest | `bc8fe0f` |

Jest: `migrationAdapters.test.js` + `parseScheduleString.test.js` — **11 passing**.

## Deferred (web WIP / incomplete on main)

- Holidays, centre calendar editor
- FWAFE-33 patient-schedule calendar polish
- FWAFE-32 medication expand UX
- Game recommendations
- Full APK — see `docs/apk_stretch_path.md`

## How To Re-Run Validation

1. Connect to NTU/PEAR VPN.
2. Confirm host TCP / login: staging User may still be 500 — prod User login should return 200.
3. Start Metro: `npx expo start --dev-client` in `PEAR_ReactNativeExpo` (avoid `CI=true`).
4. `adb reverse tcp:8081 tcp:8081`.
5. Launch app; walk Dashboard → patients → profile → schedule → Activity Overview → notes/routine/photos.
6. Watch logs: `adb logcat -s ReactNativeJS`.
