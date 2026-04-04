## 1. Logging Pattern Update

- [x] 1.1 Update backend logging pattern to print full package names for logger source.
- [x] 1.2 Keep request correlation and existing structured keys unchanged while changing logger source format.

## 2. Validation and Regression

- [x] 2.1 Verify runtime log sample no longer shows abbreviated package form like `c.t.b.a...`.
- [x] 2.2 Run backend tests (`mvn test -DskipITs`) to ensure no behavior regressions.

## 3. Documentation Alignment

- [x] 3.1 Update README/backend README logging guidance to explicitly require full package name in source output.
- [x] 3.2 Add migration note for developers to stop using abbreviated logger-source search patterns.
