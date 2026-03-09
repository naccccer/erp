# Project Map

## Goal
Build a modular, AI-friendly ERP with a clean core that can grow across industries.

## Stack
- Backend: NestJS
- Frontend: Next.js
- Database: PostgreSQL
- ORM: Prisma
- Repo: Monorepo

## Core architecture
- Modular monolith
- Multi-tenant with `tenant_id`
- RBAC + permissions
- Internal event-driven communication
- Prisma only in infra layer
- Use-case based module structure

## Product locale baseline
- Primary product language is Farsi (`fa-IR`).
- Frontend direction is RTL by default.
- LTR is allowed only for technical content where needed.

## MVP modules
- auth
- products
- contacts
- inventory
- sales
- purchasing
- finance-lite

## Module responsibilities

### auth
Owns:
- users
- roles
- permissions

### products
Owns:
- products
- product units
- price lists
- price list items

### contacts
Owns:
- customers
- suppliers
- contact info

### inventory
Owns:
- warehouses
- stock movements
- stock balances
- stock transfers

Rule:
- StockMovement is the source of truth
- StockBalance is a fast read model

### sales
Owns:
- sales invoices
- sales invoice items
- sales returns

### purchasing
Owns:
- purchase invoices
- purchase invoice items

### finance-lite
Owns:
- payments
- installment plans
- installments
- cheques
- due dates
- collection status

## Business rules
- Negative stock is not allowed.
- Serial/batch support must be possible later, but not active in MVP.
- Multiple price lists must exist in the data model, but MVP uses one default list.
- Real operations happen only after document confirmation.
- Document statuses:
  - Draft
  - Confirmed
  - Cancelled

## Event flow examples

### Sales invoice confirmed
- sales emits `sales.invoice.confirmed`
- inventory creates OUT stock movement
- finance-lite creates receivable/payment schedule if needed

### Purchase invoice confirmed
- purchasing emits `purchasing.invoice.confirmed`
- inventory creates IN stock movement

### Stock transfer confirmed
- inventory creates one OUT movement and one IN movement

## Event orchestration standard (Phase 23.5)
- Shared event contract: `DomainEvent<name, payload>` in `packages/contracts/src/events/domain-event.ts`.
- Event publishing pattern: producers publish through `publishDomainEvents` and Nest `EventEmitter2`.
- Handler registration pattern: `@OnEvent(registration.eventName)` with explicit registration constants.
- Idempotency guard pattern: handler checks already-processed stock movements before persisting.
- Handlers must be idempotent and order-independent.

### Event ownership table
| event name | emitting module | consuming module(s) |
| --- | --- | --- |
| `sales.invoice.confirmed` | `sales` | `inventory` (implemented), `finance-lite` (planned) |
| `purchasing.invoice.confirmed` | `purchasing` | `inventory` (implemented) |

## Event runtime policy (Phase 24 hardening)
- Publisher-side error containment keeps consumer failures isolated from originating HTTP requests.
- Handler execution is isolated per listener so one failing consumer does not block other consumers.
- Structured logs include `event_name`, `payload_summary`, `handler_index`, and `handler_outcome`.
- Inventory handlers also log per-handler success/failure with payload summaries to improve traceability.

## Shared contracts
Stored in `packages/contracts`:
- event names
- permission keys
- shared DTO contracts
- enums

Current shared contracts:
- `packages/contracts/src/events/domain-event.ts`
- `packages/contracts/src/events/sales.events.ts`
- `packages/contracts/src/events/purchasing.events.ts`
- `packages/contracts/src/permissions/sales.permissions.ts`
- `packages/contracts/src/permissions/purchasing.permissions.ts`

## Current implementation target status
Implemented:
- `sales/create-sales-invoice`
- `sales/confirm-sales-invoice` (prepares `sales.invoice.confirmed` event)
- `inventory/stock-movement-base` (warehouse, stock movement model, stock balance read model placeholder)
- `inventory/react-to-sales-invoice-confirmed` (creates OUT stock movements from `sales.invoice.confirmed`)
- `contacts/module-skeleton`
- `products/module-skeleton`
- `finance-lite/module-skeleton`
- `finance-lite/register-payment`
- `purchasing/module-skeleton`
- `purchasing/create-purchase-invoice`
- `purchasing/confirm-purchase-invoice` (emits `purchasing.invoice.confirmed`)
- `inventory/react-to-purchase-invoice-confirmed` (creates IN stock movements)
- `auth/foundation`
- `web/shell-layout` (sidebar, topbar, sales placeholder page; shell-only visibility)
- `api/bootstrap` (`apps/api/src/main.ts`, `apps/api/src/app.module.ts`, and provider wiring in sales, purchasing, inventory, finance-lite modules)
- `core/prisma-schema` (all core models and enums in `prisma/schema.prisma`)
- `core/infra-repositories-event-bus` (sales + inventory Prisma repositories, Nest event bus wiring, and sales-confirmation -> inventory movement persistence loop)
- `core/http-api` (sales, purchasing, finance-lite controllers and Nest HTTP bootstrap in `main.ts`)
- `web/live-sales-visibility` (sales page now consumes API endpoints and shows stock movements from `GET /inventory/movements`)
- `event-hardening` (publisher-level listener isolation, structured event logs, and duplicate delivery coverage)

Next:
- `Phase 25 - Inventory negative-stock guard`
