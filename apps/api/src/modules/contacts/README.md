# Contacts Module

## Responsibility
The Contacts module manages business parties and their core identity records.

It owns:
- customers
- suppliers

It does NOT manage:
- pricing
- inventory
- invoices

## Current Scope
- module skeleton
- customer entity placeholder
- supplier entity placeholder

## Phase 29 demo seed note
- Deterministic demo records are seeded in Prisma tables `Customer` and `Supplier` for tenant `default`.
- Seeded IDs are stable for UI forms, including `customer-1` and `supplier-1`.
