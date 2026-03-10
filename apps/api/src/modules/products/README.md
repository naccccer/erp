# Products Module

## Responsibility
The Products module manages product catalog definitions and pricing structures.

It owns:
- products
- product units
- price lists

It does NOT manage:
- stock quantities
- invoice posting

## Current Scope
- module skeleton
- product entity placeholder
- product unit entity placeholder
- price list entity placeholder

## Phase 29 demo seed note
- Deterministic demo records are seeded in Prisma table `Product` for tenant `default`.
- Seeded IDs are stable for UI forms, including `product-1` and `product-2`.
