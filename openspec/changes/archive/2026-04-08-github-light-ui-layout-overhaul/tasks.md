## 1. Theme token baseline migration

- [x] 1.1 Refactor `frontend/src/assets/design-tokens.css` to a GitHub Light token set (text hierarchy, surfaces, borders, shadows, states).
- [x] 1.2 Replace cockpit-heavy gradients/glow defaults with neutral GitHub-style light variables and keep semantic status colors readable.

## 2. Global shell and layout overhaul

- [x] 2.1 Rework `frontend/src/styles/app.scss` global shell styles (appshell/sidebar/content) to GitHub-like light layout and interaction states.
- [x] 2.2 Adjust two-pane spacing, borders, and responsive behavior to preserve left-nav ownership and right-content dominance in light theme.

## 3. Page-level UI migration

- [x] 3.1 Migrate Dashboard visuals to GitHub Light cards while preserving 3D simulation feature and interaction behavior.
- [x] 3.2 Migrate Devices / Analysis / Login page components to GitHub Light visual language (buttons, inputs, lists, cards, status chips).

## 4. Documentation and validation

- [x] 4.1 Update `frontend/README.md` and root `README.md` to describe GitHub Light theme/layout behavior and preserved Dashboard 3D capability.
- [x] 4.2 Run regressions (`npm run type-check`, `npm run build`, `mvn test -DskipITs`) after full UI/layout migration.
