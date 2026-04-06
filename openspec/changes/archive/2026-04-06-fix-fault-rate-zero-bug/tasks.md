## 1. Backend fault-rate source correction

- [x] 1.1 Replace fault-rate value derivation with device status ratio calculation (`error / total * 100`) in dashboard aggregation path.
- [x] 1.2 Keep minute trend output structure unchanged while ensuring each point reflects the corrected ratio semantics.
- [x] 1.3 Implement explicit boundary handling for zero-device and zero-error cases.

## 2. Verification and contract alignment

- [x] 2.1 Update backend unit/controller tests to assert non-zero fault rate when error devices exist and correct zero-value boundaries.
- [x] 2.2 Update frontend/backend/root README wording to document “fault rate = error devices / total devices”.
- [x] 2.3 Execute regression commands (`mvn test -DskipITs`, `npm run type-check`, `npm run build`) after the bugfix.

