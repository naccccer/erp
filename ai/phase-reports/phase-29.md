# Phase Report

## Phase
- number: 29
- title: Deterministic demo data seeding
- date: 2026-03-10

## Goal
- Provide deterministic, linked demo data for one tenant so visibility pages are explorable with meaningful non-empty records.

## Plan
- Add infra-local deterministic demo seed dataset and seed/reset command flow for warehouses, products, contacts, sales/purchase invoices, stock movements, and payments.
- Surface stable demo IDs in UI/docs and update phase reporting artifacts without changing backend API/use-case contracts.

## Changed Files
- prisma/schema.prisma
- prisma/migrations/20260310140000_phase_29_demo_catalog/migration.sql
- apps/api/src/infra/demo-seed/demo-dataset.ts
- apps/api/src/infra/demo-seed/seed-demo.ts
- apps/api/src/infra/demo-seed/test.ts
- package.json
- apps/web/src/modules/sales/server/sales-api.ts
- apps/web/src/modules/sales/components/sales-invoices-page.tsx
- apps/web/src/modules/purchasing/components/purchasing-visibility-page.tsx
- apps/web/src/modules/inventory/components/inventory-visibility-page.tsx
- apps/web/src/modules/finance/components/finance-visibility-page.tsx
- docs/demo-dataset-assumptions.md
- docs/run-tutorial.md
- apps/web/README.md
- apps/api/src/modules/contacts/README.md
- apps/api/src/modules/products/README.md
- ai/project-map.md
- ai/phase-reports/phase-29.md
- ai/phase-reports/latest.md

## Validation
- commands:
  - `pnpm run test:seed-demo`
  - `pnpm run build`
  - `docker start erp-postgres`
  - `$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/erp?schema=public'; pnpm exec prisma migrate deploy`
  - `$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/erp?schema=public'; pnpm run seed:demo:reset`
- result:
  - pass: dataset determinism test passed, API TypeScript build passed, migration deploy and reset+reseed completed with expected seeded counts.

## Reviewer Gate
- plan_verdict: APPROVED
- diff_verdict: APPROVED
- approval_token: APR-20260310-29-DIFF

## Git Manager
- commit_message: phase 29: deterministic demo data seeding
- commit_hash: pending
- branch: pending
- push_result: pending

## Outcome
- Deterministic seed flow now creates linked demo data for tenant `default` across warehouses, products, contacts, sales/purchase invoices, stock movements, and payments.
- Sales, purchasing, inventory, and finance visibility pages now surface stable demo identifiers and tenant-aware requests for seeded data checks.
- Known limitation: `seed:demo` currently runs with `--reset` by default and is equivalent to `seed:demo:reset`; behavior is documented and deterministic for this phase.

## Next Phase
- 30 - Shared Shamsi (Jalali) date field
