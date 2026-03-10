# Phase Report

## Phase
- number: 23.5
- title: Event orchestration standardization
- date: 2026-03-10

## Goal
- Define and apply one event orchestration pattern for domain events, fan-out handlers, and idempotent side effects.

## Plan
- Introduce shared `DomainEvent` and event publisher helper without changing business rules.
- Standardize inventory event handlers around registration + idempotency guard and validate fan-out behavior with tests.

## Changed Files
- packages/contracts/src/events/domain-event.ts
- packages/contracts/src/events/sales.events.ts
- packages/contracts/src/events/purchasing.events.ts
- apps/api/src/shared/events/domain-event.publisher.ts
- apps/api/src/modules/sales/use-cases/confirm-sales-invoice/use-case.ts
- apps/api/src/modules/inventory/contract/event-handler.pattern.ts
- apps/api/src/modules/inventory/contract/sales-invoice-confirmed.handler.ts
- apps/api/src/modules/inventory/contract/purchasing-invoice-confirmed.handler.ts
- apps/api/src/modules/inventory/contract/test.ts
- apps/api/src/modules/inventory/contract/purchasing-event-handler.test.ts
- apps/api/src/modules/sales/README.md
- apps/api/src/modules/inventory/README.md
- ai/project-map.md
- ai/phase-reports/phase-23.5.md
- ai/phase-reports/latest.md

## Validation
- commands:
  - `pnpm build`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/contract/test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/inventory/contract/purchasing-event-handler.test.ts`
  - `pnpm exec ts-node --project apps/api/tsconfig.json apps/api/src/modules/sales/use-cases/confirm-sales-invoice/test.ts`
- result:
  - pass: type-check and all updated event tests passed

## Reviewer Gate
- plan_verdict: APPROVED
- diff_verdict: APPROVED
- approval_token: APR-20260310-235-DIFF

## Git Manager
- commit_message: none
- commit_hash: none
- branch: none
- push_result: none

## Outcome
- Domain events now share a common interface and publishing helper.
- Inventory handlers now follow a unified registration/idempotency pattern with fan-out behavior covered by tests.

## Next Phase
- 24 - Event hardening
