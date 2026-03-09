# Phase Report

## Phase
- number: 25
- title: Inventory negative-stock guard
- date: 2026-03-10

## Goal
- Enforce the inventory invariant that stock cannot go below zero when creating sales stock-out movements.

## Plan
- Add an inventory infra stock-availability query and consume it inside the sales stock-out use-case before creating each OUT movement.
- Throw a domain-level `InsufficientStockError` on insufficient quantity and cover both guard paths with tests.

## Changed Files
- apps/api/src/modules/inventory/infra/stock-movement.repository.ts
- apps/api/src/modules/inventory/infra/prisma-stock-movement.repository.ts
- apps/api/src/modules/inventory/use-cases/create-sales-invoice-stock-out-movements/use-case.ts
- apps/api/src/modules/inventory/use-cases/create-sales-invoice-stock-out-movements/insufficient-stock.error.ts
- apps/api/src/modules/inventory/use-cases/create-sales-invoice-stock-out-movements/test.ts
- apps/api/src/modules/inventory/contract/sales-invoice-confirmed.handler.ts
- apps/api/src/modules/inventory/contract/test.ts
- apps/api/src/modules/inventory/contract/purchasing-event-handler.test.ts
- apps/api/src/modules/inventory/api/inventory-movements.controller.test.ts
- apps/api/src/modules/inventory/infra/sales-invoice-persistence.e2e.test.ts
- apps/api/src/modules/inventory/README.md
- ai/project-map.md
- ai/phase-reports/phase-25.md
- ai/phase-reports/latest.md

## Validation
- commands:
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/use-cases/create-sales-invoice-stock-out-movements/test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/contract/test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/contract/purchasing-event-handler.test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/api/inventory-movements.controller.test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/infra/sales-invoice-persistence.e2e.test.ts`
- result:
  - pass: all targeted Phase 25 tests passed; the e2e test remained skipped because `DATABASE_URL` is not set.

## Reviewer Gate
- plan_verdict: APPROVED
- diff_verdict: APPROVED
- approval_token: APR-20260310-25-DIFF

## Git Manager
- commit_message: phase 25: enforce inventory negative-stock guard
- commit_hash: none
- branch: main
- push_result: not-run

## Outcome
- Sales stock-out creation now blocks insufficient quantity and raises `InsufficientStockError`.
- Available stock is computed from stock-movement aggregates in inventory infra, and negative stock can no longer be created through the sales-confirmation flow.

## Next Phase
- 26 - Permission expansion
