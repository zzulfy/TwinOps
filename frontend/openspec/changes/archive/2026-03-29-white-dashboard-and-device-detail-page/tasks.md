## 1. Route and page scaffolding

- [x] 1.1 Add Vue Router dependency and initialize router entry wiring in app bootstrap.
- [x] 1.2 Create route structure for dashboard overview page and dedicated device detail page.
- [x] 1.3 Move current board composition into a dashboard page component and keep route-level mount stable.

## 2. Device detail flow migration

- [x] 2.1 Create route-driven device detail page composition using existing device detail presentation logic.
- [x] 2.2 Add dashboard-level "view device details" action button that navigates to the detail page.
- [x] 2.3 Update device label click interaction to navigate to detail route with selected device context.
- [x] 2.4 Add fallback behavior for direct detail route access without transient dashboard state.
- [x] 2.5 Remove or isolate modal-first detail binding from the dashboard route once navigation flow is verified.

## 3. White-first dashboard shell and tokens

- [x] 3.1 Extend design token definitions with white-first shell surface, border, and typography values.
- [x] 3.2 Refactor dashboard shell components to consume white-first tokens instead of dark-first values.
- [x] 3.3 Validate semantic status colors (normal, warning, danger, success) remain consistent under white shell.

## 4. Verification and regression checks

- [x] 4.1 Validate desktop and mobile readability for key widgets and chart labels in white-first mode.
- [x] 4.2 Verify navigation paths: dashboard button, device label click, and direct detail URL entry.
- [x] 4.3 Run build and smoke checks; document any known trade-offs or follow-up tasks.
