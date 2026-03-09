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

Completed phases up to `24` moved to `ai/roadmap-history.md`.

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
