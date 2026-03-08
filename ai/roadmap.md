# ERP Build Roadmap

## Rules
- Execute only one phase at a time
- Before writing code, show plan and touched files
- Wait for approval
- Keep diffs small
- Do not modify unrelated modules
- Update docs if behavior/contracts change
- Frontend output must be Farsi-first and RTL by default unless a phase explicitly says otherwise

---

## Phase 1 — Sales module skeleton
Goal:
Create the base sales module structure.

Tasks:
- create `apps/api/src/modules/sales/README.md`
- create `contract/`
- create `entities/`
- create `api/`
- create `infra/`
- create `use-cases/`
- create `sales.module.ts`

Done when:
- folder structure exists
- README exists
- module file exists

---

## Phase 2 — CreateSalesInvoice use case
Goal:
Create a draft sales invoice.

Tasks:
- add `SalesInvoice` entity
- add `SalesInvoiceItem` entity
- add `create-sales-invoice/use-case.ts`
- add `create-sales-invoice/dto.ts`
- add `create-sales-invoice/test.ts`

Rules:
- invoice status must be `Draft`
- no events yet
- no inventory changes
- no finance changes

Done when:
- draft invoice can be created
- test exists

---

## Phase 3 — ConfirmSalesInvoice use case
Goal:
Confirm a draft sales invoice.

Tasks:
- add `confirm-sales-invoice/use-case.ts`
- validate invoice is in Draft
- change status to Confirmed
- prepare event emission for `sales.invoice.confirmed`
- add test

Rules:
- no direct inventory writes
- no direct finance writes

Done when:
- draft invoice becomes confirmed
- event is emitted or prepared through contract

---

## Phase 4 — Shared sales contracts
Goal:
Define shared sales contracts.

Tasks:
- create `packages/contracts/src/events/sales.events.ts`
- create `packages/contracts/src/permissions/sales.permissions.ts`
- create DTO contract only if needed

Done when:
- sales event names are centralized
- sales permission keys are centralized

---

## Phase 5 — Inventory module skeleton
Goal:
Create inventory module structure.

Tasks:
- create inventory README
- create contract folder
- create entities folder
- create use-cases folder
- create api folder
- create infra folder
- create inventory.module.ts

Done when:
- module skeleton exists

---

## Phase 6 — Inventory stock movement base
Goal:
Introduce stock movement as source of truth.

Tasks:
- add `Warehouse` entity
- add `StockMovement` entity
- add `StockBalance` read model or placeholder
- add minimal local tests

Rules:
- StockMovement is the source of truth
- no direct manual stock mutation logic

Done when:
- stock movement model exists
- stock balance strategy is documented in module README

---

## Phase 7 — Inventory reaction to sales confirmation
Goal:
React to `sales.invoice.confirmed`.

Tasks:
- add inventory event handler
- create OUT stock movements from confirmed sales invoice
- add test

Rules:
- inventory reacts through event/contract
- no sales module table mutation from inventory

Done when:
- confirmed sales invoice creates stock OUT movement
- test exists

---

## Phase 8 — Contacts module skeleton
Goal:
Create contacts module structure.

Tasks:
- module skeleton
- README
- entity placeholders for customer/supplier
- module file

Done when:
- contacts module exists

---

## Phase 9 — Products module skeleton
Goal:
Create products module structure.

Tasks:
- module skeleton
- README
- entity placeholders for product/unit/price list
- module file

Done when:
- products module exists

---

## Phase 10 — Finance Lite skeleton
Goal:
Create finance-lite module structure.

Tasks:
- module skeleton
- README
- contract folder
- use-cases folder
- module file

Done when:
- finance-lite module exists

---

## Phase 11 — Payment registration base
Goal:
Register a payment record.

Tasks:
- add `Payment` entity
- add `register-payment` use case
- add dto
- add test

Rules:
- no accounting module
- finance-lite only

Done when:
- payment can be registered
- test exists

---

## Phase 12 — Purchase module skeleton
Goal:
Create purchasing module structure.

Tasks:
- module skeleton
- README
- entity placeholders
- module file

Done when:
- purchasing module exists

---

## Phase 13 — CreatePurchaseInvoice use case
Goal:
Create a draft purchase invoice.

Tasks:
- add entities
- add use case
- add dto
- add test

Rules:
- draft only
- no inventory movement yet

Done when:
- purchase draft can be created

---

## Phase 14 — ConfirmPurchaseInvoice use case
Goal:
Confirm purchase invoice.

Tasks:
- confirm draft
- emit `purchasing.invoice.confirmed`
- add test

Done when:
- event emitted after confirm

---

## Phase 15 — Inventory reaction to purchase confirmation
Goal:
Increase stock from confirmed purchase invoice.

Tasks:
- add inventory event handler
- create IN stock movement
- add test

Done when:
- confirmed purchase creates stock IN movement

---

## Phase 16 — Auth foundation
Goal:
Create auth base.

Tasks:
- user entity
- role entity
- permission entity
- tenant_id strategy where needed
- basic auth placeholders

Done when:
- auth foundation exists

---

## Phase 17 — Web shell
Goal:
Create frontend shell only.

Tasks:
- app layout
- sidebar
- topbar
- placeholder sales page

Rules:
- no heavy business logic
- keep UI modular

Done when:
- shell works
- one placeholder module page exists

---

## Phase 17.5 — Core Visibility UI
Goal:
Expose the core ERP workflow in the UI.

Tasks:
- create Sales Invoices page
- list sales invoices
- create invoice form
- confirm invoice action
- display resulting stock movement

Rules:
- must reuse existing backend use-cases
- no new backend business logic
- UI must remain simple
- keep changes isolated to the web module

Done when:
- a user can create a draft invoice from the UI
- confirm the invoice
- observe inventory stock movement result


Phase 18 — Core consistency hardening

Goal:
Align repository structure with the architecture baseline.

Tasks:

add missing sales.module.ts

verify module folder structure consistency

ensure one-use-case-per-folder

ensure DTOs are local to use-cases

add structure drift test

Rules:

no behavior changes

no new features

Done when:

modules follow structure defined in AGENTS.md

drift-check test passes

---

## Phase 19 — NestJS app bootstrap
Goal:
Wire the application so it can actually start.
Phase 18 fixed structure — this phase makes the process runnable.

Tasks:
- create `apps/api/src/main.ts` (NestJS bootstrap, PORT from env)
- create `apps/api/src/app.module.ts` (imports all 7 modules)
- create `packages/contracts/src/permissions/purchasing.permissions.ts`
- register existing use-case classes and event handlers as @Injectable providers
  in each module file (sales, purchasing, inventory, finance-lite — no new logic)

Rules:
- no behavior changes
- no Prisma yet
- no new business logic

Done when:
- `pnpm build` compiles without error
- application starts and responds (even without database)

---

## Phase 20 — Prisma schema: all core models
Goal:
Define the full persistence schema for every domain entity currently implemented.

Tasks:
- write datasource + generator blocks in `prisma/schema.prisma`
- models: `SalesInvoice`, `SalesInvoiceItem`
- models: `PurchaseInvoice`, `PurchaseInvoiceItem`
- models: `Warehouse`, `StockMovement`
- model: `Payment`
- enums: `InvoiceStatus` (Draft, Confirmed, Cancelled), `MovementType` (IN, OUT)
- all models carry `tenant_id String`

Rules:
- schema only — no repository code
- no use-case files touched
- `pnpm prisma validate` passes

Done when:
- schema compiles without error
- `prisma migrate dev --create-only` generates a valid migration

---

## Phase 21 — Core infra repositories + event bus wiring
Goal:
Establish the full Sales → Inventory persistence loop as one architectural milestone.
Proof that the entire event-driven stack functions end-to-end.

Tasks:
- `ISalesInvoiceRepository` + `PrismaSalesInvoiceRepository` in `sales/infra/`
- `IStockMovementRepository` + `IWarehouseRepository` in `inventory/infra/`
- update `CreateSalesInvoiceUseCase`, `ConfirmSalesInvoiceUseCase` to accept
  repo interface via constructor
- install `@nestjs/event-emitter`, register `EventEmitterModule` in `app.module.ts`
- add `@OnEvent` decorator to both inventory event handlers
- wire handlers and repositories as providers in their module files
- end-to-end test: confirm sales invoice → event fires → stock movement in DB

Rules:
- Prisma only inside `infra/`
- use-case business logic unchanged
- purchasing infra deferred to Phase 27 — smallest working loop first

Done when:
- creating and confirming a sales invoice persists to DB
- stock OUT movement is created in DB via the event bus

---

## Phase 22 — Core HTTP API
Goal:
Expose existing use-case flows as thin HTTP endpoints.

Tasks:
- `SalesInvoiceController` in `sales/api/`:
  - `POST /sales/invoices`
  - `POST /sales/invoices/:id/confirm`
  - `GET  /sales/invoices` (list, needed for Phase 23 UI)
- `PurchaseInvoiceController` in `purchasing/api/`:
  - `POST /purchasing/invoices`
  - `POST /purchasing/invoices/:id/confirm`
- `PaymentController` in `finance-lite/api/`:
  - `POST /finance/payments`
- register controllers in their respective module files

Rules:
- controllers are thin — no business logic
- no auth middleware yet (Phase 26)
- request body maps directly to use-case input DTO

Done when:
- all endpoints exist and return correct HTTP responses
- full flow (create → confirm → stock movement) reachable via HTTP

---

## Phase 23 — Early UI visibility: live sales → inventory flow
Goal:
Give a human user a working interface for the core ERP loop as early as possible.
Closes the feedback loop between domain logic and visible product.

Tasks:
- replace `SalesPlaceholderPage` with real `SalesInvoicesPage` (Farsi, RTL):
  - list sales invoices
  - create invoice form
  - confirm invoice button
- add read-only inventory movements panel linked to a confirmed invoice
- add `GET /inventory/movements?invoiceId=` endpoint to support the panel

Rules:
- Farsi-first, RTL layout
- no business logic in UI components
- consumes Phase 22 API endpoints only

Done when:
- user can create, confirm, and see the resulting stock movement in the browser

---

## Phase 24 — Event hardening
Goal:
Make the internal event system reliable, observable, and deterministic.
Events are the nervous system of this architecture — correctness here is structural.

Tasks:
- add idempotency guard: handler checks if `reference_id` was already processed
  before creating movements (prevents duplicate stock movements on re-delivery)
- add error containment: handler failure logs and isolates without propagating
  to the originating HTTP request
- add structured event logging (event name, payload summary, handler outcome)
- add tests:
  - duplicate event delivery does not create duplicate movements
  - handler error does not crash the caller
- document event ownership in `ai/project-map.md`:
  (event name → emitting module → consuming module(s))

Rules:
- no business logic changes
- no new events added in this phase
- idempotency key derived from `reference_id` already present in StockMovement

Done when:
- duplicate events are safely absorbed
- handler failures are contained and logged
- event ownership table is documented

---

## Phase 25 — Inventory negative-stock guard
Goal:
Enforce the core business invariant: stock cannot go below zero.

Tasks:
- add `getAvailableStock(warehouseId, productId): number` query in `inventory/infra/`
  (SUM of StockMovement records — no separate balance table)
- call the check before each OUT movement in `CreateSalesInvoiceStockOutMovementsUseCase`
- throw domain error `InsufficientStockError` if quantity exceeds available stock
- add tests:
  - OUT movement for insufficient stock is rejected
  - OUT movement within available stock succeeds

Rules:
- validation belongs to inventory module only
- no cross-module data reads

Done when:
- negative stock cannot be created
- both guard paths covered by tests

---

## Phase 26 — Permission expansion
Goal:
Apply access control as a cross-cutting concern across all exposed endpoints.
RBAC is treated as a product capability here, not a last-minute gate.

Tasks:
- create `packages/contracts/src/permissions/inventory.permissions.ts`
- create `packages/contracts/src/permissions/finance.permissions.ts`
  (purchasing.permissions.ts already exists from Phase 19)
- add `TenantPermissionGuard` in `apps/api/src/` (reads tenant_id + role from
  request context; header-based stub is acceptable here)
- add `@RequirePermission(...)` decorator; apply to all controllers (Phases 22–23)
- add tenant_id filtering to all repository queries — cross-tenant data leakage
  must be structurally impossible at the repository layer
- update module READMEs to document which permission key each endpoint requires

Rules:
- no business logic changes
- real JWT integration is a separate auth phase
- permission keys centralized in `packages/contracts` only

Done when:
- all HTTP endpoints are guarded
- cross-tenant data access is blocked at the repository layer
- permission keys are documented per endpoint

---

## Phase 27 — Purchasing + finance infra repositories
Goal:
Complete persistence for purchasing and finance-lite flows.

Tasks:
- `IPurchaseInvoiceRepository` + `PrismaPurchaseInvoiceRepository` in `purchasing/infra/`
- update purchasing use-cases to accept repo interface
- wire purchasing `@OnEvent` handler into the event bus
- `IPaymentRepository` + `PrismaPaymentRepository` in `finance-lite/infra/`
- update `RegisterPaymentUseCase` to accept repo interface
- update tests to use mock repositories

Done when:
- purchase invoices and payments persist through Prisma
- confirming a purchase invoice creates a stock IN record in DB

---

## Phase 28 — Sales returns
## Phase 29 — Inventory reaction to sales returns
## Phase 30 — Reporting foundations
Goal (Phase 30):
Establish the read side of the system as a first-class product capability.
Tasks include: per-tenant sales totals, live stock levels by warehouse and product,
payment summary, and a dashboard data API.
Uses aggregate queries against existing Prisma models — no new write-side logic.
Introduces the concept of dedicated read use-cases (query-only, no side effects).

## Phase 31 — Inventory transfer draft and confirm
## Phase 32 — Inventory adjustments
## Phase 33 — Price list management
