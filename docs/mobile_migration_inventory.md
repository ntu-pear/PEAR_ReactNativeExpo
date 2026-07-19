# PEAR React Native Migration Inventory

This inventory tracks the remaining migration from legacy/mobile-specific API calls to the PEAR microservice contracts used by `PEAR_WebFE`.

## Service Baseline

- User Service: `http://10.96.188.185/api/v1` in `app/api/client.js`.
- Patient Service: `http://10.96.188.180/api/v1` in `app/api/client.js`.
- Scheduler Service: `http://10.96.188.186:5679` in `app/api/client.js`.
- Activity Service: not originally configured in mobile; web uses an Activity Service base for routines and activity preferences.

Atlassian's mobile onboarding page states the current focus is migrating mobile services to the new server and fixing functionality broken by that migration. Treat Atlassian docs as supporting context; verify against staging Swagger and app behavior.

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Auth/login/current user | Migrated | Uses v1 User Service and v1 token keys, but some legacy token reads remain. |
| Patient list/read/add/update | Mostly migrated | Uses Patient Service v1 with local response normalization. |
| Allergies, vitals, mobility, problem logs, medical history, prescriptions | Mostly migrated | Screens still contain some response-shape assumptions. |
| Patient allocations and caregiver filters | Mostly migrated | Some legacy patient count behavior remains. |
| Highlights | Mostly migrated | Uses Patient Service staging shape adapters. |
| Scheduler read/generate | Mostly migrated | Shared schedule parser now tolerates activity-only slots and malformed medication segments; live re-validation pending on VPN. |
| Doctor notes | Mostly migrated | Mobile API now uses Patient Service and normalizes list responses for the existing screen. |
| Activity preferences | Mostly migrated | Mobile API now uses Activity Service endpoints and preserves existing mobile response shape. |
| Routine | Mostly migrated | Screen now calls Activity Service routine endpoint. |
| Photos and holidays | Mostly migrated | Added `patientApi` methods for photo album/photo list, upload, update, and delete. Holiday metadata is passed through when the backend supports it. |
| Notifications | Partial | User notification endpoints need live validation and accept/reject confirmation. |
| Admin, role, access-level, logger, game therapist surfaces | Web-only for now | Do not port unless product scope changes. |

## Priority Migration Targets

1. Validate existing and newly migrated endpoints on the Android emulator.
2. Update focused Jest/Detox coverage for adapter and parity-critical flows.
3. Confirm holiday metadata support in the Patient Service; current photo endpoints pass metadata through when accepted by the backend.
4. Confirm whether doctor notes should stay read-only on mobile or gain add/edit/delete UI.
5. Revisit notifications, relationship lists, medication endpoint probing, and patient status counts after emulator validation.

## Emulator Validation Checklist

Record service base, method/path, status, response shape, and app screen for each validation.

- Existing migrated endpoints: login, refresh, current user, patient list/read, allocations, allergies, vitals, prescriptions, problem logs, medical history, mobility, highlights, schedule read.
- Newly migrated endpoints: doctor notes, activity preferences, centre activities, routines, photo albums/photos, scheduler generation.
- Known network requirement: the emulator must reach `10.96.188.x` via the same network/VPN as the host; `10.0.2.2` only applies to services running on the dev machine.
