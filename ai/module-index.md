# Module Index

Use this file to quickly locate the correct module before reading code.

## Core rule
For small changes, read only:
1. `AGENTS.md`
2. `ai/project-map.md`
3. `ai/roadmap.md`
4. this file
5. the target module `README.md`
6. the target module local `AGENTS.md` if it exists

Do not scan unrelated modules unless contracts/events require it.

---

## Roadmap Lifecycle
- `ai/roadmap.md` contains active phases only.
- `ai/roadmap-history.md` contains compact archived phases.
- `ai/phase-reports/*` contains detailed execution evidence per completed phase.

---

## auth
Path:
- `apps/api/src/modules/auth`

Owns:
- users
- roles
- permissions

Read this module when task is about:
- login
- authorization
- role checks
- permission checks

Do not read first for:
- sales logic
- inventory logic
- payments

---

## products
Path:
- `apps/api/src/modules/products`

Owns:
- products
- product units
- price lists
- price list items

Read this module when task is about:
- creating/editing products
- units
- price list rules

Do not read first for:
- stock deduction
- invoice confirmation

---

## contacts
Path:
- `apps/api/src/modules/contacts`

Owns:
- customers
- suppliers
- contact data

Read this module when task is about:
- customer lookup
- supplier lookup
- contact records

Do not read first for:
- stock movement
- payment registration

---

## inventory
Path:
- `apps/api/src/modules/inventory`

Owns:
- warehouses
- stock movements
- stock balances
- stock transfers

Rules:
- StockMovement is the source of truth
- no direct manual stock mutation outside inventory

Read this module when task is about:
- stock in/out
- warehouse transfer
- balance calculation

Do not read first for:
- draft sales invoice creation

---

## sales
Path:
- `apps/api/src/modules/sales`

Owns:
- sales invoices
- sales invoice items
- sales returns

Rules:
- Sales must not write inventory data directly
- Sales must not write finance data directly
- document lifecycle: Draft → Confirmed → Cancelled

Read this module when task is about:
- creating draft invoice
- confirming invoice
- cancelling invoice
- sales totals / lines

Read first files:
- `apps/api/src/modules/sales/README.md`
- `apps/api/src/modules/sales/AGENTS.md` if it exists
- target use-case folder

---

## purchasing
Path:
- `apps/api/src/modules/purchasing`

Owns:
- purchase invoices
- purchase invoice items

Read this module when task is about:
- draft purchase invoice
- purchase confirmation

---

## finance-lite
Path:
- `apps/api/src/modules/finance-lite`

Owns:
- payments
- installment plans
- installments
- cheques
- due dates
- collection status

Read this module when task is about:
- payment registration
- cheque handling
- installment scheduling

Do not read first for:
- stock balance
- product setup

---

## contracts
Path:
- `packages/contracts/src`

Contains:
- event names
- permission keys
- shared DTO contracts
- enums

Read this only when:
- public event names change
- shared DTO shape changes
- permission keys change

Do not put business logic here.

---

## How to choose context

### If task says "create draft sales invoice"
Read only:
- `AGENTS.md`
- `ai/project-map.md`
- `ai/roadmap.md`
- `ai/module-index.md`
- `apps/api/src/modules/sales/README.md`
- `apps/api/src/modules/sales/use-cases/create-sales-invoice/*`

### If task says "react to sales invoice confirmation in inventory"
Read only:
- `AGENTS.md`
- `ai/project-map.md`
- `ai/roadmap.md`
- `ai/module-index.md`
- `packages/contracts/src/events/*`
- `apps/api/src/modules/inventory/README.md`
- relevant inventory handler/use-case files

### If task says "change shared sales event name"
Read only:
- `AGENTS.md`
- `ai/project-map.md`
- `ai/module-index.md`
- `packages/contracts/src/events/*`
- `apps/api/src/modules/sales/README.md`

---

## Stop rule
If the requested task appears to need more than:
- one module
- one contract area
- one use-case folder

first explain why, then continue only within roadmap scope.
