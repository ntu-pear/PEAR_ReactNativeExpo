# Bulk ad-hoc dependency

Aug31 accepted requirement: supervisor selects an activity and today/tomorrow; only patients already scheduled for that selected activity are affected. Exact names and count must be shown before confirmation, using existing weekly data without generation/regeneration.

Read-only source references:
- Activity `origin/staging` 968de7ca14775a323c093b78877c8f67e780a082: app/routers/adhoc_router.py exposes POST /api/v1/adhocs/ for one patient. AdhocCreate requires patient_id, old_centre_activity_id, new_centre_activity_id, start_date, end_date, status and created_by_id. No bulk operation or idempotency key exists in source/OpenAPI.
- app/crud/adhoc_crud.py create_adhoc validates existence of the patient/centre activities, commits one record and emits its outbox event. It does not validate a selected weekly slot/revision, enforce already-scheduled-today/tomorrow eligibility or reject duplicate patient/activity/date creates.
- Scheduler origin/scheduler_staging 5534a61d75866e6c2845234cf705d50be3a08220: GET /schedule/getSchedule/ reads existing WeeklyScheduleView and returns title-based day strings/JSON. It removes ScheduleID from the response. No stable centre_activity_id or revision token is provided per slot. Duplicate activity titles cannot be mapped authoritatively to one centre activity.
- Web origin/main ec8b58cf09ca5f84198bc8455b10b0d7bdf156e5: src/pages/Supervisor/AddAdhoc.tsx activity-wide branch explicitly returns "Activity-wide adhoc isn't available yet"; the per-patient API is src/api/activities/adhoc.ts. Mobile legacy scheduler /schedule/adhoc/ is not a substitute Activity CRUD batch endpoint.

Required backend contract before enabling bulk mobile writes:
1. A read/preview operation returning exact eligible patient IDs/names, stable selected centre-activity ID, date in Asia/Singapore and schedule revision for today/tomorrow only.
2. A supervisor-authorized batch request using that confirmed set/revision, validating current eligibility server-side. Define atomicity or per-patient accepted/rejected results, plus idempotency/request ID and status lookup so a timeout can be reconciled without duplicate writes.
3. The mobile screen must display exact names/count and replacement/date, allow cancellation, confirm once, and surface partial/unknown outcomes. It must never generate schedules for eligibility or guess duplicate titles.

A series of current single-patient POSTs would permit partial application and duplicates after timeout, and cannot prove stable selected-slot identity. That behavior does not satisfy the accepted bulk requirement. Bulk remains blocked on this contract; it is not claimed implemented or passed. Backend sources were only read; no backend changes or live mutations were performed.
