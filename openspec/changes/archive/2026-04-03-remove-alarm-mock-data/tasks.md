## 1. Footer alarm data source cleanup

- [x] 1.1 Remove hardcoded alarm mock list and computed mock mapping from `frontend/src/components/LayoutFooter.vue`.
- [x] 1.2 Wire `LayoutFooter` to call `fetchAlarmList` when opening alarm popup and pass API results to `AlarmDeviceList`.
- [x] 1.3 Add local loading/error state in `LayoutFooter` and propagate to popup component props.

## 2. Alarm popup rendering behavior

- [x] 2.1 Extend `frontend/src/components/AlarmDeviceList.vue` to render loading, error, and empty states from props.
- [x] 2.2 Keep existing item rendering for API-backed records and align field usage with `AlarmListItem` contract.
- [x] 2.3 Ensure popup never renders fallback mock items when backend request fails.

## 3. Validation

- [x] 3.1 Run frontend type check and build to confirm change safety.
- [x] 3.2 Manually verify behavior: backend available shows API alarms; backend unavailable shows error/empty state only.
