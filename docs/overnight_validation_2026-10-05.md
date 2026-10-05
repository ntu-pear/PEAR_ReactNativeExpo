# Mobile validation, 5 October 2026

The isolated mobile snapshot is based on original commit `7bfb0b6c3570f5b9fc148ee138051a086a6579f9`. The original checkout and uncommitted files remain preserved. Only mobile source changed. No production data, backend change, push, merge or deployment is included.

## Implemented changes

- Patient profile: 30-second deadline, visible error/retry, stale focus/patient guards and retention of masked/missing optional fields. Guardian/social sections and six social lookup lists load only when opened. See [FPM-119](https://fyppear.atlassian.net/browse/FPM-119).
- Shared requests/login: loading settles on thrown adapters and timeouts; queued 401 retries receive one refresh per request. Login rejects empty credentials locally. Changed login paths no longer log passwords or bearer headers.
- Medication: exact patient/medication/time/day matching, taken-status recheck, inclusive +/-30-minute warnings, alternate assigned-user confirmation, actual current actor and refresh. A timed-out PUT is **unknown**, may still complete, and retains a pending marker through restart/logout. Repeated recording is blocked; Check status only reads. An untaken row alone does not clear uncertainty. Only a definitive rejection plus untaken status, or recorded status, resolves the attempt. There is no replacement PUT on timeout.
- Medication controls require SUPERVISOR, matching the current scheduler GET/PUT guard. Other roles see an explanation. Historical caregiver requirements need a backend permission decision; no bypass was added. See [medication requirements](https://fyppear.atlassian.net/wiki/spaces/FP/pages/637861922/New+Manage+Patient+Medication+Schedule).
- Centre clock: scheduler staging deployment at `5534a61` sets `TZ=Asia/Singapore`. Medication day and window use UTC+08:00 explicitly. Old confirmations are refused if the day changes before sending. Midnight boundaries are tested on a GMT host. Runtime deployment settings were not independently queried.
- Guardians: caregivers/supervisors can edit relationship and contact fields through current Patient API. Fresh full records preserve identity, status and login linkage, use the real actor and verify persisted fields/relationship. Supervisor primary selection uses the existing allocation endpoint, fresh linkage/allocation reads, preserves all staff fields and swaps the former primary to secondary. Unverified writes cannot report success or repeat in the editing session. Relationship names are validated by the service; it exposes no relationship-list endpoint. Live integration remains untested.
- Exclusions: Pending/Active/Active (indefinite)/Expired/Unknown dates; impossible dates rejected; expired records do not block new activity selection. See [exclusion requirements](https://fyppear.atlassian.net/wiki/spaces/FP/pages/800948313/Manage+Patient+Activity+Exclusion).

- Startup: authenticated navigation and unused debug navigation are deferred until login; Login/Register/Reset screens load only when opened. The installed 1.0.2 build missed a 20-second public readiness threshold on cold launch3 and reached login later. That failed observation and splash screenshot are retained. A bootstrap regression proves protected modules are not loaded before login; final replacement APK smoke is recorded separately. Deferral reduces unnecessary initial work; it does not establish the cause of emulator delay.

## Verification

Focused regressions: 101 passed in 15 suites. Full app suite: 103 passed, 32 failed, 25 suites, 10 failed suites, one failed snapshot. Baseline: 38 passed, 32 failed, 14 suites. All 32 final failing identities/assertion bodies match baseline; DashboardNavigator's two assertions ran and retain the baseline Expo Asset failures. No new or missing failed identities. The full suite is red; no snapshot was updated.

Changed-source ESLint has zero errors; exact warning count is in final-eslint.log and START_HERE. Release build, APK identity, installation and public smoke evidence are supplied separately. JavaScript project has no dedicated TypeScript check. Detox/authenticated staging flows were not run: no designated test login/data was provided.

Controlled profile measurement: three initial core reads become one; primary response ready at 30 ms while optional mocked responses delay to 400 ms. This proves request/lifecycle improvement in the harness, not real device latency or the cause of Eileen/JunJie symptoms. No hardware diagnosis can be made from an unprovided PC-spec image.

## Remaining dependencies

- Bulk ad-hoc: see `bulk_adhoc_backend_dependency.md` for current endpoint/source evidence and required batch contract. No client fan-out or scheduler mutation was introduced.
- Authenticated staging role flows and device-specific latency need reserved accounts/data. Four host OpenAPI endpoints returned HTTP200, not proof of authenticated emulator connectivity. Medication GET creates slots as a side effect and was never called live.
- Exact professor SharePoint workbook could not be obtained. The supplied workbook is explicitly provisional, with blank professor remarks and honest statuses.
- Notification backend is not proven available; Sep14 requirements describe a proposal.
- Supported Library helper fails on Windows `os.setxattr`; no auth or metadata bypass, remote upload or Library ID is claimed.
