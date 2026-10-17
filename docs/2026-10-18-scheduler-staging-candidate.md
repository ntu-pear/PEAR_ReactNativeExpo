# Scheduler staging candidate — 18 October 2026

Version1.0.20 / Android code21. This is a staging candidate using the repository's existing debug signing configuration; it is not a production deployment.

Patient weekly schedule now uses GET /schedule/patient/{patient_id}/ with optional route date, one data endpoint, explicit401/403/503 states and HTTP200/Status404 empty saved-week behavior. It never generates or regenerates a missing schedule. Late, blurred, unmounted or different-patient responses cannot replace the active screen.

Patients → Today’s Medication is available to supervisor and caregiver. It displays Scheduler's role-scoped today-dose list without a second patient/allocation API. Given doses retain actual actor/time; a dose from another Singapore calendar day cannot be administered. The existing prescriptions/course pages remain separate. Names/photos, full course details and consolidated historical dose filtering require an aggregated backend contract and are not represented as complete here.

Administration copies the current slot identity, supports the caregiver role, uses the token-derived actor, rejects ambiguous/malformed slots and retains persisted duplicate/uncertain-write guards. Confirmation is cancelled when its active page/account changes. The final request pins the checked bearer so a later login cannot substitute another actor. Existing ±30 minute warning remains advisory; no late-dose override contract is invented.

## Validation

The integrated mocked regression command covers schedule API/privacy/parser, today-dose page, medication guards/confirmation/persistence, course reads, centre course view and Patients landing. Results and exact totals are recorded in the local final review pack. Mocked checks do not establish live E2E or installed-device acceptance.

The staging OpenAPI schema exposes the required endpoints. GET /MedicationSchedule/get/ creates today's slots, so do not treat it as a harmless read-only probe. Only explicitly designated synthetic staging fixtures may be used for write-capable E2E.

## Build and handover

Build from a clean commit with Java17 using android\gradlew.bat assembleRelease. Preserve the previous APK first. preBuild generates app/config/generatedBuildIdentity.json with source commit, dirty state, version/code and date. Record APK SHA256, manifest identity and installed About identity separately. Native identity is authoritative; Expo/package versions are aligned for this candidate.

Continue cornelius/patient-loading-review-20261005; preserve its six earlier local commits. Ordinary feature-branch push only. No web/backend edits, no main merge or production deployment.

## Backend questions

1. Single aggregated centre administration/history endpoint with date range, all/my scope, names/photos, pagination and retained administered history.
2. Explicit late-dose/supervisor-override policy, allowed days/times and required audit reason.
3. Stable slot identifier when patient/name/day/time is ambiguous across courses.
4. Whether supervisor undo hiding patient-facing History meets retained-history requirements; identify the authoritative audit endpoint.
5. Confirm freeze target deployed commits and shared staging fixtures/photos.

Contracts: https://fyppear.atlassian.net/wiki/spaces/FP/pages/968294402 and /968392705. Next-week preview is now documented, but remains outside this minimum candidate.
