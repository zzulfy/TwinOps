## 1. Alarm Workflow UI

- [x] 1.1 Extend `frontend/src/api/backend.ts` with typed alarm status support, status-filtered alarm fetch, and status update request helper.
- [x] 1.2 Update `frontend/src/components/WidgetPanel06.vue` to add status tabs (`new/acknowledged/resolved`) and action buttons for `acknowledged` and `resolved` transitions.
- [x] 1.3 Add error handling and list reconciliation logic so alarm actions do not leave inconsistent UI state.

## 2. Dashboard Summary Consistency and Refresh

- [x] 2.1 Introduce shared summary fetch semantics in frontend API layer (single in-flight fetch + optional forced refresh).
- [x] 2.2 Refactor dashboard summary consumers (`WidgetPanel01.vue`, `WidgetPanel04.vue`) to use shared summary data behavior.
- [x] 2.3 Add manual refresh entry and last-successful-update timestamp display in dashboard shell/header context.

## 3. Device Aggregate Filtering

- [x] 3.1 Update `frontend/src/pages/DeviceDetailPage.vue` to maintain derived filtered device list from fetched aggregate dataset.
- [x] 3.2 Add keyword search (name/deviceCode) and status filter controls (`normal/warning/error`) with clear/reset behavior.
- [x] 3.3 Preserve default all-device aggregate rendering and existing scrolling behavior when no filters are active.

## 4. Documentation and Verification

- [x] 4.1 Update `README.md` with new frontend capabilities and end-to-end verification steps (alarm actions, summary refresh, device filters).
- [x] 4.2 Update `frontend/README.md` and `backend/README.md` to document new UI interactions and alarm API usage examples.
- [x] 4.3 Run existing checks (`frontend: npm run type-check && npm run build`, `backend: mvn test -DskipITs`) to confirm stability.
