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
