# Emulator Endpoint Validation

Date: 2026-06-21

## Result

Endpoint validation against PEAR staging services is blocked by network reachability.

## Emulator

- `adb` path used: `C:\Users\User\AppData\Local\Android\Sdk\platform-tools\adb.exe`
- Connected emulator: `emulator-5554`
- The emulator image does not include `curl` or `wget`, so raw HTTP probes from `adb shell` are unavailable.

## Emulator Network Preflight

All PEAR staging service IP pings from the emulator failed with 100% packet loss:

- User Service: `10.96.188.185`
- Patient Service: `10.96.188.180`
- Activity/Scheduler host: `10.96.188.186`

## Host HTTP Preflight

HTTP checks from the host also timed out:

- `http://10.96.188.185/docs#/`
- `http://10.96.188.180/docs#/`
- `http://10.96.188.186/docs#/`
- `http://10.96.188.186:5679/docs#/`

## Interpretation

This is not just an emulator routing issue. The host session also cannot reach the PEAR staging network, so endpoint validation requires connecting the machine to the required NTU/PEAR network or VPN first.

## Pending Endpoint Validation

After network access is restored, validate these flows from the Android emulator through the app:

- Existing migrated endpoints: login, refresh, current user, patient list/read, allocations, allergies, vitals, prescriptions, problem logs, medical history, mobility, highlights, schedule read.
- Newly migrated endpoints: doctor notes, activity preferences, centre activities, routines, photo albums/photos, scheduler generation.

Record method/path, service base, status code, response shape, screen tested, and expected web/API parity for each flow.
