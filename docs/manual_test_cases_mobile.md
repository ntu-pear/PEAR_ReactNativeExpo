# Manual test cases — PEAR mobile (tablet)

Paste-ready rows for Prof’s manual-test Excel. Leave **Tester comment** empty for Prof.

Environment: internal release APK `com.pearreactnativeexpo`, NTU/PEAR VPN, staging bases (User `.185`, Patient `.180`, Activity `.186`, Scheduler `.186:5679`). Do not mix production User with staging data services.

| ID | Role | Area | Steps | Expected | Tester comment |
| --- | --- | --- | --- | --- | --- |
| M-01 | Supervisor | Login | Install APK (no Metro). Open app. Sign in with staging Supervisor credentials. | Login succeeds and dashboard loads. Error is visible if VPN/staging is down. | |
| M-02 | Caregiver | Login | Sign in with staging Caregiver credentials. | Login succeeds. Supervisor-only cards (create activity / generate schedule) are not offered as caregiver tools. | |
| M-03 | Supervisor | Patients | Open Patients. Search / open one patient profile. | Patient list and profile load. Name and photo appear when the API returns them. | |
| M-04 | Supervisor | Profile | From a patient profile, open Schedule. | Today/week schedule renders without crashing on v1 JSON day maps. | |
| M-05 | Supervisor | Activity Overview | Open **Activity Overview**. | One page shows Preferences, Doctor Recommendations, and Exclusions. Failed sections show an error, not a fake empty success. | |
| M-06 | Caregiver | Activity Overview / prefs | As Caregiver, open Activity Overview. Tap **Manage Preferences**. Change a like/dislike and save. | Caregiver can update preferences. Recommendations and exclusions remain read-only. | |
| M-07 | Supervisor | Activity Overview / prefs | As Supervisor, open Activity Overview and Manage Preferences. | Supervisor can also update preferences. Dedicated Activity Preference card remains on the profile. | |
| M-08 | Caregiver | Role gate | On patient profile as Caregiver. | Activity Overview and Routine are visible. Dedicated Activity Preference card and Doctor Notes are hidden. | |
| M-09 | Supervisor | Notes / routine / photos | Open doctor notes, activity routine, and photo album for the same patient. | Each screen loads or fails visibly. No silent mock data. | |
| M-10 | Supervisor or Caregiver | Medication — assigned | Open Medications. On a dose due **today**, tap administer. If you **are** the assigned caregiver, confirm once (patient, med, dosage). | Confirm dialog shows patient + med + dosage. On OK, scheduler records `AdministeredBy` as the current user, or a visible failure if today’s slot is missing. | |
| M-11 | Supervisor or other caregiver | Medication — not assigned | Repeat administer while **not** the patient’s assigned caregiver. | Extra “Not the assigned caregiver” confirm appears first, then the normal confirm. Success only if scheduler update returns OK. No silent `console.log` success. | |
| M-12 | Any | Staging vs prod | After login, use patient/activity/schedule features. | App stays on staging hosts. Do not point User at production while Patient/Activity/Scheduler stay on staging. | |
| M-13 | Any | Notifications | Open Notifications. | 404 / empty-with-error is acceptable. User Service has no notification routes (same gap as web mock). | |

Notes for testers:

- Exclusion **create** UX is not in this APK (web/backend-owned; stay behind web `main`).
- FWAFE-33 calendar polish and FWAFE-32 row-click expand are not in this APK.
- Patient Service recently added guardian NRIC lookup for signup; that path is web/guardian, not this tablet caregiver/supervisor demo.
