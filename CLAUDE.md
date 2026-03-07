# CLAUDE.md

This file provides guidance for AI assistants working in this repository.

---

## Quick Navigation

Before starting any task, read only what the task requires:

1. This file (`CLAUDE.md`)
2. `ai/project-map.md` — architecture and module ownership
3. `ai/roadmap.md` — phased implementation plan
4. `ai/module-index.md` — which module to read for a given task
5. The target module `README.md`
6. The target use-case folder files

Do not scan unrelated modules unless the task explicitly crosses module boundaries.

---

## Project Overview

An AI-friendly modular ERP system built for Farsi-speaking businesses.

- **Architecture:** Modular monolith, hexagonal layers, event-driven cross-module communication
- **Multi-tenancy:** `tenant_id` on all owned entities
- **Access control:** RBAC with permission keys from `packages/contracts`
- **Primary language:** Farsi (`fa-IR`), RTL layout by default

---

## Technology Stack

| Layer | Technology |
|---|---|
| Backend | NestJS 11 + TypeScript 5 |
| Frontend | Next.js 15 + React 19 + TypeScript 5 |
| Database | PostgreSQL |
| ORM | Prisma 7 (infra layer only) |
| Package manager | pnpm 10.30.3 |
| Testing | Jest 30 + ts-jest |

---

## Repository Structure

```
erp/
├── apps/
│   ├── api/                          # NestJS backend
│   │   └── src/modules/
│   │       ├── auth/
│   │       ├── contacts/
│   │       ├── finance-lite/
│   │       ├── inventory/
│   │       ├── products/
│   │       ├── purchasing/
│   │       └── sales/
│   └── web/                          # Next.js frontend
│       └── src/modules/
│           ├── sales/
│           └── shell/
├── packages/
│   └── contracts/                    # Shared events, permissions, DTOs, enums
│       └── src/
│           ├── events/
│           └── permissions/
├── prisma/
│   └── schema.prisma                 # Database schema
├── ai/                               # AI development guides
│   ├── roadmap.md
│   ├── project-map.md
│   ├── module-index.md
│   ├── coding-rules.md
│   └── reviewer-rules.md
└── AGENTS.md                         # Core AI rules
```

---

## Module Structure (all backend modules follow this pattern)

```
modules/<name>/
├── README.md                         # Module purpose, owned entities, events, use-cases
├── AGENTS.md                         # Module-specific AI rules (if present)
├── <name>.module.ts                  # NestJS module definition
├── contract/                         # Local contracts and event types
├── entities/                         # Domain model interfaces (no Prisma)
├── use-cases/
│   └── <action-domain>/
│       ├── use-case.ts               # Business logic
│       ├── dto.ts                    # Input/output types
│       ├── test.ts                   # Unit tests
│       ├── validator.ts              # (optional)
│       └── mapper.ts                 # (optional)
├── api/                              # NestJS controllers (HTTP layer)
└── infra/                            # Prisma repositories (only place Prisma is allowed)
```

---

## Module Ownership

| Module | Owns |
|---|---|
| `auth` | users, roles, permissions |
| `products` | products, product units, price lists, price list items |
| `contacts` | customers, suppliers, contact info |
| `inventory` | warehouses, stock movements, stock balances, stock transfers |
| `sales` | sales invoices, sales invoice items, sales returns |
| `purchasing` | purchase invoices, purchase invoice items |
| `finance-lite` | payments, installment plans, installments, cheques, due dates, collection status |

---

## Implemented Use Cases (Phase 17 complete)

| Module | Use Case |
|---|---|
| sales | `create-sales-invoice`, `confirm-sales-invoice` |
| purchasing | `create-purchase-invoice`, `confirm-purchase-invoice` |
| inventory | `create-sales-invoice-stock-out-movements`, `create-purchase-invoice-stock-in-movements` |
| finance-lite | `register-payment` |
| auth | foundation entities only |
| contacts, products | module skeleton only |
| web | shell layout (sidebar, topbar, sales placeholder) |

---

## Event Flow

Modules communicate exclusively via events — never by calling each other's use-cases or writing to each other's data.

```
sales.confirm-sales-invoice
  → emits: sales.invoice.confirmed
    → inventory: creates OUT stock movement

purchasing.confirm-purchase-invoice
  → emits: purchasing.invoice.confirmed
    → inventory: creates IN stock movement

inventory.stock-transfer-confirmed
  → inventory: creates OUT movement + IN movement
```

Shared event names and permission keys live in `packages/contracts`.

---

## Document Lifecycle

All transactional documents (sales invoices, purchase invoices) follow:

```
Draft → Confirmed → Cancelled
```

- Real operations (stock movements, finance records) only happen on `Confirmed`.
- Negative stock is not allowed.

---

## Architecture Rules

- **Prisma only in `infra/`** — domain, use-case, and api layers must not import Prisma directly.
- **One use-case per folder** — never combine multiple use-cases in one file.
- **DTOs next to use-cases** — `dto.ts` lives in the same folder as `use-case.ts`.
- **No direct cross-module writes** — use events or contracts.
- **No barrel exports** — no `index.ts` re-exports; use explicit imports.
- **Module-local code preferred** — avoid shared utilities unless truly shared.

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Domain entities | PascalCase | `SalesInvoice`, `SalesInvoiceItem` |
| Use-case classes | `[Action][Domain]UseCase` | `CreateSalesInvoiceUseCase` |
| Event classes | `[Domain][Action]Event` | `SalesInvoiceConfirmedEvent` |
| Event string names | lowercase dot-separated | `sales.invoice.confirmed` |
| File names | kebab-case | `create-sales-invoice/use-case.ts` |
| Constants | SCREAMING_SNAKE_CASE | `SALES_INVOICE_CONFIRMED` |

Avoid domain synonyms (`bill`, `voucher`, `order service`) unless the domain explicitly requires them.

---

## Frontend Rules

- All UI text must be **Farsi by default**.
- Page layout direction must be **RTL by default**.
- Use LTR only for technical tokens (codes, numbers, IDs) when needed.
- Non-Farsi UI requires explicit task instruction.
- UI components are module-local; shared components must contain no business logic.
- Shared contracts come from `packages/contracts` only.

---

## Testing

- Every new use-case must have a `test.ts` in its folder.
- Update tests whenever behavior changes.
- Tests are colocated with the use-case, not in a central `__tests__` directory.
- Run tests with: `pnpm test` (from repo root or app directory).

---

## Development Workflow (Roadmap-Driven)

When working from `ai/roadmap.md`:

1. Execute **one phase at a time**.
2. Before writing code, produce a short plan listing files that will change.
3. Wait for approval before implementing.
4. Implement the phase. Stop when it is complete.
5. Do not start a subsequent phase without explicit instruction.

**Scope guard:** If the task requires changes outside the target module or roadmap phase, list the prerequisite and stop — do not implement it unilaterally.

---

## Completion Checklist

Before finishing any task, verify:

- [ ] Scope stayed inside the intended module
- [ ] No unrelated files changed
- [ ] Naming follows project conventions (see above)
- [ ] Tests added or updated if behavior changed
- [ ] Module `README.md` updated if ownership, events, or public use-cases changed
- [ ] `ai/project-map.md` updated if architecture changed
- [ ] `packages/contracts` updated if public event names, permission keys, or shared DTO shapes changed

---

## Shared Contracts

Location: `packages/contracts/src/`

| File | Contents |
|---|---|
| `events/sales.events.ts` | Sales event names |
| `events/purchasing.events.ts` | Purchasing event names |
| `permissions/sales.permissions.ts` | Sales permission keys |

Do not put business logic in contracts.

---

## Package Manager

Use **pnpm only**. Never use npm or yarn.

```bash
pnpm install          # install dependencies
pnpm test             # run tests
pnpm dev              # start development server (from app directory)
pnpm build            # build for production
```

---

## Key Business Rules

- Negative stock is not allowed.
- Real operations (stock, finance) happen only after document confirmation.
- Serial/batch tracking is not active in MVP but the data model must support it later.
- Multiple price lists exist in the data model; MVP uses one default list.
- `StockMovement` is the append-only source of truth; `StockBalance` is a derived read model.
