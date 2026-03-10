# Phase Report

## Phase
- number: 26
- title: Permission expansion
- date: 2026-03-10

## Goal
- Apply endpoint-level permission control and tenant-safe repository filtering across exposed API surfaces.

## Plan
- Add centralized permission contracts plus a shared tenant permission guard/decorator stack and apply permissions to all Phase 22-23 controllers.
- Enforce tenant_id filtering in repository query methods and update docs/tests to reflect permission keys per endpoint.

## Changed Files
- packages/contracts/src/permissions/inventory.permissions.ts
- packages/contracts/src/permissions/finance.permissions.ts
- apps/api/src/shared/auth/require-permission.decorator.ts
- apps/api/src/shared/auth/request-context.ts
- apps/api/src/shared/auth/tenant-permission.guard.ts
- apps/api/src/shared/auth/tenant-permission.guard.test.ts
- apps/api/src/app.module.ts
- apps/api/src/modules/sales/api/sales-invoice.controller.ts
- apps/api/src/modules/purchasing/api/purchase-invoice.controller.ts
- apps/api/src/modules/inventory/api/inventory-movements.controller.ts
- apps/api/src/modules/finance-lite/api/payment.controller.ts
- apps/api/src/modules/sales/infra/sales-invoice.repository.ts
- apps/api/src/modules/sales/infra/prisma-sales-invoice.repository.ts
- apps/api/src/modules/inventory/infra/stock-movement.repository.ts
- apps/api/src/modules/inventory/infra/prisma-stock-movement.repository.ts
- apps/api/src/modules/inventory/contract/event-handler.pattern.ts
- apps/api/src/modules/inventory/use-cases/create-sales-invoice-stock-out-movements/use-case.ts
- apps/api/src/modules/sales/api/sales-invoice.controller.test.ts
- apps/api/src/modules/sales/use-cases/create-sales-invoice/test.ts
- apps/api/src/modules/sales/use-cases/confirm-sales-invoice/test.ts
- apps/api/src/modules/inventory/api/inventory-movements.controller.test.ts
- apps/api/src/modules/inventory/contract/test.ts
- apps/api/src/modules/inventory/contract/purchasing-event-handler.test.ts
- apps/api/src/modules/inventory/use-cases/create-sales-invoice-stock-out-movements/test.ts
- apps/api/src/modules/sales/README.md
- apps/api/src/modules/purchasing/README.md
- apps/api/src/modules/inventory/README.md
- apps/api/src/modules/finance-lite/README.md
- ai/project-map.md
- ai/phase-reports/phase-26.md
- ai/phase-reports/latest.md

## Validation
- commands:
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/shared/auth/tenant-permission.guard.test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/sales/api/sales-invoice.controller.test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/sales/use-cases/create-sales-invoice/test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/sales/use-cases/confirm-sales-invoice/test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/purchasing/api/purchase-invoice.controller.test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/finance-lite/api/payment.controller.test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/api/inventory-movements.controller.test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/contract/test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/contract/purchasing-event-handler.test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/use-cases/create-sales-invoice-stock-out-movements/test.ts`
  - `pnpm build`
- result:
  - pass: all targeted tests passed and TypeScript build completed successfully.

## Reviewer Gate
- plan_verdict: APPROVED
- diff_verdict: APPROVED
- approval_token: APR-20260310-26-DIFF

## Git Manager
- commit_message: phase 26: expand endpoint permissions and tenant query guards
- commit_hash: none
- branch: main
- push_result: not-run

## Outcome
- All exposed controllers now require explicit permission keys enforced by `TenantPermissionGuard`.
- Repository query paths in sales and inventory are tenant-scoped, preventing cross-tenant reads at data-access boundaries.

## Next Phase
- 27 - Purchasing + finance infra repositories
