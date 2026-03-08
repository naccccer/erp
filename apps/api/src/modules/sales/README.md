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

Current Phase 3 behavior:
- ConfirmSalesInvoice prepares this event through `contract/sales.events.ts`
- The prepared event payload contains tenant, invoice, and item data for downstream modules
- Event names are centralized in `packages/contracts/src/events/sales.events.ts`

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
Creates a draft sales invoice.

### ConfirmSalesInvoice
Confirms a draft invoice and prepares `sales.invoice.confirmed`.

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

# Nest Wiring (Phase 19)

- `SalesModule` registers these providers:
  - `CreateSalesInvoiceUseCase`
  - `ConfirmSalesInvoiceUseCase`
