# Interim report — mobile (PEAR React Native)

Paste-ready section for the ~24 Aug 2026 interim report. Scope is the Supervisor/Caregiver **tablet** app on `cornelius/api-migration`, measured against `PEAR_WebFE` `origin/main` (not unmerged web WIP).

## Scope

PEAR mobile is a tablet client for **Supervisor** and **Caregiver** day-to-day work at the centre: patients, schedule, activity preferences / recommendations / exclusions, notes, routines, photos, and medication. It is **functional parity with web**, not a pixel clone. Admin, game-therapist, and centre-calendar editor surfaces stay web-only.

The current milestone is the v1 microservice migration (User, Patient, Activity, Scheduler on staging `10.96.188.x`). Mobile stays one step behind web `main` unless a UI is built in anticipation of an API, in which case the team is told.

## Done (as of 17 Aug 2026)

- Auth, patient list/read, and most patient sub-resources talk to Patient / User Service v1 with response adapters.
- Scheduler read uses a shared `parseScheduleDay()` so dashboard and patient schedule accept v1 JSON day maps.
- Tablet **Activity Overview** shows preferences, doctor recommendations, and exclusions on one patient page. Caregivers can **update preferences**; creating centre activities, generating schedules, exclusions, and routines remain supervisor-only.
- Host-level API checks (VPN + staging Supervisor token) have returned **200** for login, patients, preferences, exclusions, routines, doctor notes, photos, and schedule. Doctor-recommendation **patient path still 404** and falls back to the list endpoint. Notifications return **404** because User Service OpenAPI has no notification routes (web Navbar is still mocked).
- Internal **release APK** (`com.pearreactnativeexpo`, debug-signed, ~30 MB) builds with Gradle `assembleRelease` and runs without Metro. It is kept locally; it has **not** been placed in Teams.
- Medication **administer** no longer silently `console.log`s. If the logged-in user is not the assigned caregiver, an extra confirm is shown. The clicker is recorded via Scheduler `PUT /MedicationSchedule/update/` when a matching today’s slot exists. If that endpoint is missing or the slot is not found, the UI reports failure and does **not** claim success.

## Gaps (honest)

- Full in-app tap-through on the release APK still needs a human login. Host APIs were validated; adb typing of emails/passwords is unreliable, so “E2E all passed” is **not** claimed.
- Unmerged web work is **not** on mobile: FWAFE-33 schedule calendar polish, FWAFE-32 medication row-click expand, FWAFE-30 exclusion-create filter, holidays, centre calendar.
- Notification backend routes do not exist on User Service v1.
- APK is debug-signed for internal demo only (no Play Store / production key).
- Staging vs production must not be mixed; Prof tests through the UI. Current bases are staging User `.185`, Patient `.180`, Activity `.186`, Scheduler `.186:5679`.

## Test evidence for Prof (~24 Aug)

Manual test-case rows for the Excel sheet are in `docs/manual_test_cases_mobile.md` (tester-comment column left empty for Prof). Install notes are in `docs/apk_stretch_path.md`.
