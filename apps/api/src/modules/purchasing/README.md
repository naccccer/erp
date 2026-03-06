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
