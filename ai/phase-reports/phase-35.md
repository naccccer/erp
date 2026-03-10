# Phase Report

## Phase
- number: 35
- title: Sales ops console v1
- date: 2026-03-11

## Goal
- Upgrade sales into an operations-first screen with practical list operations and focused invoice detail visibility.

## Plan
- Add query normalization plus in-page filter/sort/pagination mechanics for sales list operations.
- Add selected-invoice detail panel (items + related inventory movements) and keep stable list/detail empty/error/loading feedback in Farsi.

## Changed Files
- ai/project-map.md
- apps/web/README.md
- apps/web/app/globals.css
- apps/web/app/sales/page.tsx
- apps/web/src/modules/sales/components/sales-invoices-page.tsx
- apps/web/src/modules/sales/server/sales-ops-query.ts
- apps/web/src/modules/sales/server/sales-ops-query.test.ts
- ai/phase-reports/archive/phase-34.md
- ai/phase-reports/phase-34.md (moved to archive)
- ai/phase-reports/phase-35.md
- ai/phase-reports/latest.md

## Validation
- commands:
  - `pnpm exec ts-node --project apps/web/tsconfig.json apps/web/src/modules/sales/server/sales-ops-query.test.ts`
  - `pnpm exec ts-node --project apps/web/tsconfig.json apps/web/src/modules/sales/server/core-visibility-workflow.test.ts`
  - `pnpm --dir apps/web exec tsc --noEmit`
  - `pnpm run test:structure-drift`
- result:
  - pass: all commands completed successfully.

## Approval
- approval_type: human
- approval_status: approved
- approval_reference: user message "approved" on 2026-03-11

## Git Manager
- verdict: APPROVED
- staged_files: ai/project-map.md;apps/web/README.md;apps/web/app/globals.css;apps/web/app/sales/page.tsx;apps/web/src/modules/sales/components/sales-invoices-page.tsx;apps/web/src/modules/sales/server/sales-ops-query.ts;apps/web/src/modules/sales/server/sales-ops-query.test.ts;ai/phase-reports/phase-35.md;ai/phase-reports/latest.md;ai/phase-reports/phase-34.md;ai/phase-reports/archive/phase-34.md
- commit_message: phase 35: sales ops console v1
- commit_hash: none
- branch: main
- commit_result: success

## Outcome
- Sales now supports tenant-aware filtering, deterministic sorting, and pagination in one operational list flow.
- Selected invoice details now show both invoice items and related inventory movements with explicit empty/error handling.

## Next Phase
- 36 - Master data read readiness
