# Sales Module

## Responsibility
The Sales module manages customer sales transactions.

It owns:
- sales invoices
- sales invoice items
- sales returns

It does NOT manage:
- inventory stock logic
- payments or receivables
- customer records

Those belong to other modules.

---

# Owned Entities

Sales owns these domain entities:

- `SalesInvoice`
- `SalesInvoiceItem`
- `SalesReturn` (future)

SalesInvoice contains:
- customer_id
- invoice_date
- status
- total_amount

SalesInvoiceItem contains:
- product_id
- quantity
- unit_price
- discount
- line_total

---

# Document Lifecycle

Sales invoices follow this lifecycle:

Draft  
→ Confirmed  
→ Cancelled

Rules:

- Draft: editable, no business effects
- Confirmed: triggers business actions
- Cancelled: reverses previous effects

Business operations only happen after **confirmation**.

---

# Events Emitted

Sales emits events after important actions.

### sales.invoice.confirmed

Triggered when a sales invoice is confirmed.

Current behavior:
- `ConfirmSalesInvoiceUseCase` prepares this event through `contract/sales.events.ts`
- The prepared event payload contains tenant, invoice, and item data for downstream modules
- The event is emitted through the shared `publishDomainEvents` helper and Nest `EventEmitter2`
- The shared publisher contains handler errors and logs structured event outcome records so confirmation HTTP flow stays deterministic
- Event names are centralized in `packages/contracts/src/events/sales.events.ts`
- Event contract shape follows `packages/contracts/src/events/domain-event.ts`

Consumers:

- Inventory → reduce stock
- Finance → create receivable / payment schedule

### sales.invoice.cancelled

Triggered when a confirmed invoice is cancelled.

Consumers:

- Inventory → reverse stock movement
- Finance → reverse receivable

---

# Public Use Cases

These are the operations exposed by this module.

### CreateSalesInvoice
Creates and persists a draft sales invoice through `ISalesInvoiceRepository`.

### ConfirmSalesInvoice
Confirms a draft invoice, persists status change, and emits `sales.invoice.confirmed`.

### CancelSalesInvoice
Cancels a confirmed invoice and emits `sales.invoice.cancelled`.

---

# Module Boundaries

Sales must NOT:

- change stock balances directly
- write to inventory tables
- write to finance tables

Instead it must emit events.

Example:

sales.invoice.confirmed  
→ inventory reacts  
→ finance reacts

---

# Dependencies

Sales depends on:

Products  
Contacts

It must not depend on:

Inventory  
Finance

Communication with those modules happens only through events.

## Event Ownership Rules (Phase 23.5)

- Sales owns creation and publication of `sales.invoice.confirmed`.
- Sales does not orchestrate downstream module side effects directly.
- Consumer modules own their own handlers and idempotency behavior.

---

# HTTP API (Phase 22)

- `POST /sales/invoices` -> create draft invoice
- `POST /sales/invoices/:id/confirm` -> confirm draft invoice
- `GET /sales/invoices?tenant_id=...` -> list tenant invoices

---

# Future Extensions

Possible future features:

- discounts engine
- tax rules
- credit limits
- sales orders / quotations
- price list selection
- promotions

---

# Nest Wiring (Phase 21)

- `SalesModule` registers these providers:
  - `PrismaSalesInvoiceRepository`
  - `ISalesInvoiceRepository` token -> `PrismaSalesInvoiceRepository`
  - `CreateSalesInvoiceUseCase`
  - `ConfirmSalesInvoiceUseCase`
