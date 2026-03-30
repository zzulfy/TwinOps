## 1. Database Foundation

- [x] 1.1 Create MySQL schema SQL files for `devices`, `device_metrics`, and `alarms` with required indexes (`device_code`, time-window query indexes).
- [x] 1.2 Add schema execution documentation and ordered initialization steps for local/test environments.
- [x] 1.3 Add deterministic seed SQL for 50 devices including `device_code` and `label_key` mappings.
- [x] 1.4 Add deterministic telemetry and alarm seed data linked to seeded devices.

## 2. Backend Core Modules (Java + MyBatis Plus)

- [x] 2.1 Scaffold backend module boundaries for `device`, `telemetry`, `alarm`, and `dashboard` in a single application.
- [x] 2.2 Implement device APIs for listing/querying device master data by `device_code` and label mapping fields.
- [x] 2.3 Implement telemetry query APIs with bounded time-window parameters and 30-day retention constraints.
- [x] 2.4 Implement alarm query/status APIs supporting `new`, `acknowledged`, and `resolved` states.
- [x] 2.5 Implement dashboard aggregation API returning device scale summary, alarm summary, and chart-ready metric summary.

## 3. Retention and Data Lifecycle

- [x] 3.1 Implement telemetry cleanup strategy that guarantees only the latest 30 days are retained.
- [x] 3.2 Add verification query/script proving records older than 30 days are excluded or cleaned.

## 4. Frontend Data Source Switch

- [x] 4.1 Replace device detail page fixed/random business data with backend API responses.
- [x] 4.2 Replace dashboard device scale and alarm panel fixed data with backend API responses.
- [x] 4.3 Replace dashboard metric chart random data with backend metric APIs.
- [x] 4.4 Implement deterministic empty/error states for API failures or empty datasets.

## 5. End-to-End Validation

- [x] 5.1 Validate seeded 50-device dataset can initialize a clean MySQL instance and power all required frontend views.
- [x] 5.2 Validate no fixed/random business data path remains in dashboard/device-detail rendering flows.
- [x] 5.3 Validate dashboard aggregation and detail endpoints meet frontend field contract expectations.
- [x] 5.4 Document local runbook: DB init, seed execution, backend startup, frontend integration check.
