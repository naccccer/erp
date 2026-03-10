# Purchasing Module

## Responsibility
The Purchasing module manages supplier purchase documents.

It owns:
- purchase invoices
- purchase invoice items

It does NOT manage:
- inventory movement writes
- finance postings

## Current Scope
- create-purchase-invoice use case
- confirm-purchase-invoice use case
- Prisma persistence through `IPurchaseInvoiceRepository`
- confirmation publishes `purchasing.invoice.confirmed` via Nest event bus

## Public Use Cases
- CreatePurchaseInvoice
- ConfirmPurchaseInvoice

## Events Emitted
- `purchasing.invoice.confirmed`

## Shared Contracts
- `packages/contracts/src/permissions/purchasing.permissions.ts`

## Nest Wiring (Phase 19)
- `PurchasingModule` registers:
  - `CreatePurchaseInvoiceUseCase`
  - `ConfirmPurchaseInvoiceUseCase`

## Infra Persistence (Phase 27)
- `PURCHASE_INVOICE_REPOSITORY` token is bound to `PrismaPurchaseInvoiceRepository`.
- Draft creation persists purchase invoices and invoice items in Prisma.
- Confirmation persists status transition to `Confirmed` before emitting domain events.

## HTTP API (Phase 22)
- `POST /purchasing/invoices` -> create draft purchase invoice
- `POST /purchasing/invoices/:id/confirm` -> confirm draft purchase invoice

## Permissions (Phase 26)
- `POST /purchasing/invoices` requires `purchasing.invoice.create`
- `POST /purchasing/invoices/:id/confirm` requires `purchasing.invoice.confirm`
