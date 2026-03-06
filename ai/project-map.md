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

## Shared contracts
Stored in `packages/contracts`:
- event names
- permission keys
- shared DTO contracts
- enums

Current shared contracts:
- `packages/contracts/src/events/sales.events.ts`
- `packages/contracts/src/events/purchasing.events.ts`
- `packages/contracts/src/permissions/sales.permissions.ts`

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
- `web/shell-layout` (sidebar, topbar, sales placeholder page)

Next:
- roadmap phase complete through Phase 17
