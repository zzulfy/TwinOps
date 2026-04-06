## 1. Backend metric semantics and time label alignment

- [x] 1.1 Update dashboard fault-rate trend time label formatting to return `HH:mm` only for minute-bucket points.
- [x] 1.2 Align backend contract/documented semantics from "fault-rate change" to "fault rate" without changing minute refresh cadence.
- [x] 1.3 Adjust backend tests to assert minute-bucket labels and `HH:mm` formatting behavior.

## 2. Frontend fault-rate chart module updates

- [x] 2.1 Update WidgetPanel04 chart title/legend/tooltip/y-axis wording to use "故障率" semantics.
- [x] 2.2 Ensure x-axis renders one-minute points with `HH:mm` labels only and no month/day text.
- [x] 2.3 Keep history sliding interaction and verify forecast line remains visually distinguishable from history line.

## 3. Documentation and regression alignment

- [x] 3.1 Update frontend/backend/root README chart description to use "故障率" and minute `HH:mm` axis wording.
- [x] 3.2 Run required regression commands for backend tests and frontend type-check/build after semantic and label changes.

