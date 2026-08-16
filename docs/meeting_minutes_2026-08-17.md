# Meeting Minutes — 17 Aug 2026 (Cornelius / Mobile)

Paste-ready for the team minutes spreadsheet. Prof (Chan Syin) is the source of truth; spoken “all E2E passed” from 3 Aug is **not** restated as fact.

## Done

- Otter-aligned the 3–17 Aug sprint to Prof’s asks (22 Jun / 6 Jul / 20 Jul / 3 Aug ~18:00 SGT): combined caregiver Activity Overview, early APK for ~24 Aug testing, manual test-case rows, administer confirm if clicker is not assigned caregiver.
- Activity Overview: caregiver can view prefs + recs + exclusions together and **update preferences**; recs/exclusions stay read-only; failed recs/prefs/exclusions fail visibly (list fallback for recs is currently also **404** on staging). Supervisor-only create activity / generate schedule / exclusion / routine unchanged.
- Medication administer: extra confirm when the logged-in user is not the assigned caregiver; persist via Scheduler `PUT /MedicationSchedule/get|update/` when today’s slot exists. No silent `console.log` success. Patient Service latest (`origin/staging`) is guardian NRIC lookup — not an administer API.
- Internal **release APK** rebuilt locally (`assembleRelease`, `com.pearreactnativeexpo`, debug-signed). Tester install notes updated. **Teams upload not done**.
- Drafted paste-ready interim-report mobile section (`docs/interim_report_mobile_section.md`) and manual test-case rows for Prof’s Excel (`docs/manual_test_cases_mobile.md`, tester-comment column empty).
- Host API refresh (VPN, staging Supervisor token): login, patients, prefs, exclusions, routines, notes, photos, schedule, **medication schedule** all **200**. Recs patient + list **404**. Notifications **404**. Full in-app tap-through still needs a human login.

## In progress

- Interim report submission ~24 Aug; Prof manual testing of the APK.
- Teams “manual test order” APK share still on Cornelius if wanted later.

## Next week (waiting on web / backend)

- FWAFE-33 patient-schedule calendar polish (unmerged).
- FWAFE-32 medication expand-on-row-click UX (unmerged).
- Exclusion-create filter (FWAFE-30), holidays, centre calendar.
- Notification routes on User Service.
- Doctor recommendations patient/list path on Activity Service (currently 404).
