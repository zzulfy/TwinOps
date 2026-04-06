## 1. Inventory and target layout definition

- [x] 1.1 Inventory scattered files in repository root and `frontend/` root, then classify them by purpose (script/report/tmp/data/config)
- [x] 1.2 Define target directory taxonomy and create a relocation mapping (old path -> new path)
- [x] 1.3 Identify commands, docs, and automation references impacted by path relocation

## 2. File relocation and reference updates

- [x] 2.1 Create dedicated directories and move scattered files in `frontend/` root into structured subdirectories
- [x] 2.2 Reorganize scattered root-level artifacts into appropriate domain directories while keeping root as entry layer
- [x] 2.3 Update npm scripts, helper scripts, and internal path references to the new locations

## 3. Behavior parity validation

- [x] 3.1 Run existing frontend type-check/build flow to confirm no regression from relocation
- [x] 3.2 Run existing backend test flow to confirm cross-workspace stability
- [x] 3.3 Run critical smoke or verification commands that depend on moved scripts and confirm success

## 4. Documentation and rollout hygiene

- [x] 4.1 Update README directory tree and command examples to match the reorganized layout
- [x] 4.2 Add concise migration notes for old-to-new paths used in local troubleshooting
- [x] 4.3 Remove or quarantine obsolete temporary artifacts that are no longer needed after verification
