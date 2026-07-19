# Emulator Endpoint Validation

Date: 2026-07-06 (updated)

## Environment

- Emulator: `emulator-5554` (`Medium_Tablet_API_33`)
- App package: `com.pearreactnativeexpo`
- Metro: `localhost:8081` with `adb reverse tcp:8081 tcp:8081`
- VPN required for `10.96.188.x` staging services

## Network Preflight

| Check | 2026-06-21 (no VPN) | 2026-06-27 (VPN on) | 2026-07-06 (VPN on) |
| --- | --- | --- | --- |
| Host TCP to User Service (`10.96.188.185:80`) | Failed | Passed | **502 Bad Gateway** |
| Host TCP to Patient Service (`10.96.188.180:80`) | Failed | Passed | **Reachable (401 without token)** |
| Host TCP to Activity Service (`10.96.188.186:80`) | Failed | Passed | **Reachable (401 without token)** |
| Host TCP to Scheduler (`10.96.188.186:5679`) | Failed | Passed | **Passed (200)** |
| Prod User Service login (`10.96.188.171:5678`) | Not tested | Not tested | **200** |
| Emulator ICMP ping to staging | Failed | Failed (ICMP blocked) | Not retested |

## Validated In-App (2026-07-06, VPN connected)

| Flow | Service | Endpoint | Result |
| --- | --- | --- | --- |
| App bundle load | Metro | `http://localhost:8081` | Pass |
| Login attempt | User Service (staging) | `POST /api/v1/login/` | **Blocked — HTTP 502 from nginx** |
| Scheduler API (host) | Scheduler Service | `GET /schedule/getSchedule/` | Pass — 14 patients, object-shaped day fields |
| Schedule parser (unit + live data) | N/A | `parseScheduleDay()` | Pass — handles v1 object day maps |

Login test account attempted: e2e Supervisor credentials from repo (`jess@gmail.com`).

## Fix Applied (2026-07-06)

Scheduler v1 now returns each day as a JSON object (`{"09:00-09:30": "Free and Easy", ...}`), not the legacy `--`-delimited string. Mobile previously stringified these objects and failed during medication parsing.

- Shared parser updated: `app/utility/parseScheduleString.js` (`parseScheduleDay()` handles both object and legacy string formats)
- Used by `DashboardScreen.js` and `PatientScheduleScreen.js`
- Jest coverage updated and passing

## Pending Live Validation (VPN required)

Record method/path, status, response shape, screen, and parity notes for each:

| Flow | Service | Status |
| --- | --- | --- |
| Login / refresh / current user | User | Previously pass |
| Patient list / read / allocations | Patient | Not re-tested this session |
| Allergies / vitals / prescriptions / problem logs / medical history / mobility | Patient | Not re-tested this session |
| Highlights | Patient | Previously pass |
| Schedule read (post-fix) | Scheduler | Fix applied — needs live re-test |
| Schedule generate | Scheduler | Not re-tested this session |
| Doctor notes | Patient | API migrated — needs live re-test |
| Activity preferences / centre activities | Activity | API migrated — needs live re-test |
| Routines | Activity | API migrated — needs live re-test |
| Photo albums / photos / holidays | Patient | API migrated — needs live re-test |
| Notifications accept/reject | User (`/Notification/*`) | Partial migration — needs live re-test |

## How To Re-Run Validation

1. Connect to NTU/PEAR VPN.
2. Start Metro: `npx expo start` in `PEAR_ReactNativeExpo`.
3. Ensure `adb reverse tcp:8081 tcp:8081`.
4. Launch app on emulator and log in as Supervisor.
5. Walk through Dashboard, patient profile cards, and notifications.
6. Watch logs: `adb logcat -s ReactNativeJS`.
