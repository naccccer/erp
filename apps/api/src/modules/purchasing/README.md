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

## HTTP API (Phase 22)
- `POST /purchasing/invoices` -> create draft purchase invoice
- `POST /purchasing/invoices/:id/confirm` -> confirm draft purchase invoice

## Permissions (Phase 26)
- `POST /purchasing/invoices` requires `purchasing.invoice.create`
- `POST /purchasing/invoices/:id/confirm` requires `purchasing.invoice.confirm`
