# Phase Report

## Phase
- number: 27
- title: Purchasing + finance infra repositories
- date: 2026-03-10

## Goal
- Complete persistence for purchasing and finance-lite flows, including purchase-confirmation inventory stock-in persistence through the event bus.

## Plan
- Add repository interfaces and Prisma infra implementations for purchase invoices and payments, then inject them into purchasing and finance-lite use-cases.
- Persist purchase-invoice confirmation status, publish `purchasing.invoice.confirmed` through the Nest event bus, and validate the purchase -> inventory persistence path with tests.

## Changed Files
- apps/api/src/modules/purchasing/infra/purchase-invoice.repository.ts
- apps/api/src/modules/purchasing/infra/prisma-purchase-invoice.repository.ts
- apps/api/src/modules/purchasing/use-cases/create-purchase-invoice/use-case.ts
- apps/api/src/modules/purchasing/use-cases/confirm-purchase-invoice/use-case.ts
- apps/api/src/modules/purchasing/use-cases/create-purchase-invoice/test.ts
- apps/api/src/modules/purchasing/use-cases/confirm-purchase-invoice/test.ts
- apps/api/src/modules/purchasing/api/purchase-invoice.controller.ts
- apps/api/src/modules/purchasing/api/purchase-invoice.controller.test.ts
- apps/api/src/modules/purchasing/purchasing.module.ts
- apps/api/src/modules/purchasing/README.md
- apps/api/src/modules/finance-lite/infra/payment.repository.ts
- apps/api/src/modules/finance-lite/infra/prisma-payment.repository.ts
- apps/api/src/modules/finance-lite/use-cases/register-payment/use-case.ts
- apps/api/src/modules/finance-lite/use-cases/register-payment/test.ts
- apps/api/src/modules/finance-lite/api/payment.controller.ts
- apps/api/src/modules/finance-lite/api/payment.controller.test.ts
- apps/api/src/modules/finance-lite/finance-lite.module.ts
- apps/api/src/modules/finance-lite/README.md
- apps/api/src/modules/inventory/infra/purchase-invoice-persistence.e2e.test.ts
- ai/project-map.md
- ai/phase-reports/phase-27.md
- ai/phase-reports/latest.md

## Validation
- commands:
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/purchasing/use-cases/create-purchase-invoice/test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/purchasing/use-cases/confirm-purchase-invoice/test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/finance-lite/use-cases/register-payment/test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/purchasing/api/purchase-invoice.controller.test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/finance-lite/api/payment.controller.test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/infra/purchase-invoice-persistence.e2e.test.ts`
  - `pnpm build`
- result:
  - pass: purchasing and finance-lite use-case/controller tests passed; TypeScript build passed.
  - skipped: `purchase-invoice-persistence.e2e.test.ts` was skipped because `DATABASE_URL` was not set in this session.

## Reviewer Gate
- plan_verdict: APPROVED
- diff_verdict: APPROVED
- approval_token: APR-20260310-27-DIFF

## Git Manager
- commit_message: phase 27: add purchasing and finance prisma repositories
- commit_hash: none
- branch: main
- push_result: not-run

## Outcome
- Purchase invoice create/confirm flows now persist through Prisma-backed purchasing infra repositories.
- Confirming a purchase invoice now publishes `purchasing.invoice.confirmed` through the event bus, enabling inventory stock `IN` persistence in runtime flow.
- Payment registration now persists through a Prisma-backed finance-lite repository.

## Next Phase
- 28 - Sales returns
