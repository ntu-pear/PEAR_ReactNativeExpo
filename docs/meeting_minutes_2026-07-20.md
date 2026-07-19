# Meeting Minutes — 20 Jul 2026 (Cornelius / Mobile)

Paste-ready for the team minutes spreadsheet / tracker.

## Done

- Set up Confluence meeting-notes folder for AI (accessible notes: [20260622](https://fyppear.atlassian.net/wiki/spaces/FP/pages/973701121/20260622), [20260706](https://fyppear.atlassian.net/wiki/spaces/FP/pages/973733891/20260706)).
- Landed scheduler v1 JSON day parser (`parseScheduleDay`) + Jest on `cornelius/api-migration` (`965e629`) so dashboard/patient schedule tolerate `{"09:00-09:30": "..."}` day maps.
- Shipped web-parity tablet **Activity Overview** (Preferences / Doctor Recommendations / Exclusions) for caregiver + supervisor — real Activity Service calls, no silent mocks (`bc8fe0f`).
- Host E2E with VPN: patient list/read, prefs, exclusions, routines, doctor notes, photo albums, schedule GET all **200** (Supervisor token via prod User Service).
- Regression: 11 Jest adapter/parser tests passing; emulator screenshot + APK stretch path documented (`docs/apk_stretch_path.md`).

## In progress

- Full in-app emulator walkthrough (login → profile → schedule → Activity Overview → notes/routine/photos) — Metro/dev-client JS load stuck this session after VPN; re-run once Metro connects cleanly.
- Staging User Service login currently returns HTTP 500; mobile temporarily uses prod User Service for auth so login can proceed when the app loads.

## Next week (waiting on web / deferred)

- Match FWAFE-33 patient-schedule calendar polish (weekly dropdown / current-time line / hour windowing) after web merges.
- FWAFE-32 medication expand-on-row UX after web merges.
- Holidays (not on web main yet).
- Centre schedule calendar editor (web mock-only / unrouted).
- Full APK delivery after school reopens (per 6 Jul guidance).

## Notes

- Web-parity gate followed: only ported features already complete on `PEAR_WebFE` `main`; Bryan’s unmerged schedule calendar UX left for next week.
- Soft note: intermittent staging auth / Metro availability affected live UI demo; host API path for the demo flows is already validated.
