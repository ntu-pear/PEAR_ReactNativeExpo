# Emulator Endpoint Validation

Date: 2026-08-03 (updated)

## Environment

- Emulator: `emulator-5554` (`Medium_Tablet_API_33`)
- App package: `com.pearreactnativeexpo`
- Metro: `localhost:8081` with `adb reverse tcp:8081 tcp:8081` (dev-client)
- VPN required for `10.96.188.x` services

## Network Preflight (2026-08-03, VPN on)

| Check | Result |
| --- | --- |
| Staging User login (`10.96.188.185`) | **200** (recovered; app `V1_BASE` pointed back to staging) |
| Prod User login (`10.96.188.171:5678`) | **200** (fallback) |
| Patient Service | Reachable |
| Activity Service | Reachable |
| Scheduler | Reachable |

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

Demo path covered at host level: login → patients → profile data → schedule → prefs/recs/exclusions → notes/routine/photos.

## In-app emulator (2026-08-03)

| Step | Result |
| --- | --- |
| Emulator present | Pass |
| Metro / adb reverse | Pass |
| Dev-client load | Pass after bundle (screenshots `2026-08-03_*.png`) |
| Full typed UI walkthrough | Host path green; in-app login/tap-through used for smoke when Metro connected |

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

## How To Re-Run Validation

1. Connect to NTU/PEAR VPN.
2. Confirm staging User login returns 200.
3. `npx expo start --dev-client` + `adb reverse tcp:8081 tcp:8081`.
4. Walk login → patients → profile → schedule → Activity Overview → notes/routine/photos → notifications.
5. `adb logcat -s ReactNativeJS`.
