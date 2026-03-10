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

Note:
Backend feature phases 28-33 are deferred for a visibility-first UI track.
Backend logic and API contracts stay stable during these phases.

---

## Phase 28 - Navigation + visibility shell hardening
Goal:
Make navigation fully functional and route to real pages (no dead links),
while preserving Farsi-first + RTL defaults.

Tasks:
- add real routes/pages for `sales`, `purchasing`, `inventory`, `finance`
  (minimal but working visibility pages)
- make sidebar active-state route-aware
- add per-page visibility checkpoint panel
  (what data is shown, last action result)

Done when:
- sidebar links navigate to real pages with no dead links
- every page renders Farsi labels with RTL layout by default
- each page has a visible checkpoint block confirming load status

---

## Phase 29 - Deterministic demo data seeding
Goal:
Make the app explorable with realistic linked data.

Tasks:
- add deterministic seed flow (single demo tenant) for:
  warehouses, products, contacts, sales/purchase invoices, stock movements, payments
- add reset + reseed command documentation (pnpm-based)
- add a demo dataset assumptions doc snippet for IDs used by UI forms

Done when:
- running seed commands produces repeatable dataset each time
- sales, purchasing, inventory, and finance pages show meaningful non-empty data after seed
- no backend API/use-case contract changes are required

---

## Phase 30 - Shared Shamsi (Jalali) date field
Goal:
Standardize Jalali date input UX for Iranian users.

Tasks:
- introduce one reusable RTL Jalali date field component in the web module
- convert Jalali input to ISO for existing API payloads
  (client-side/server-action boundary only)
- replace native date input usage in active form pages with the shared field

Done when:
- users select dates in a Shamsi calendar UI
- submitted payloads remain compatible with current backend date handling
- displayed dates are consistent in Jalali format across pages

---

## Phase 31 - Purchasing visibility workflow page
Goal:
Provide a practical purchasing page using existing create/confirm endpoints.

Tasks:
- build a purchasing page with draft create + confirm flow
- show immediate checkpoint result for invoice status and related inventory impact lookup
- keep interactions minimal and stable (no new backend endpoints)

Done when:
- users can create and confirm purchase invoices from UI
- UI shows confirmation result and corresponding inventory movement checkpoint
- flow works against seeded demo data without manual DB edits

---

## Phase 32 - Finance + inventory checkpoint pages
Goal:
Expose finance payment registration and inventory movement lookup as operational visibility tools.

Tasks:
- finance page: register payment and show response checkpoint
- inventory page: query/display movements by reference/invoice ID with tenant-aware context
- add clear empty/error states in Farsi

Done when:
- payment registration works end-to-end from UI
- inventory movement lookup reliably shows seeded and newly created movement records
- navigation between operational pages is stable

---

## Phase 33 - UI visibility integration pass (no polish scope)
Goal:
Lock practical flow consistency across pages without broad redesign/refactor.

Tasks:
- normalize page-level loading/error/success checkpoint patterns
- validate tenant header/context handling from UI consistently
- tighten minimal responsive behavior for desktop/mobile usability

Done when:
- end-to-end visibility runbook passes:
  seed -> sales -> purchasing -> inventory -> finance
- no dead navigation paths, no mixed LTR defaults, and no Gregorian-only date entry points
- scope remains UI-focused; backend behavior remains unchanged
