# Inventory Module

## Responsibility
The Inventory module manages stock-related operations.

It owns:
- warehouses
- stock movements
- stock balances
- stock transfers

## Rules
- StockMovement is the source of truth.
- Inventory manages stock changes inside this module only.
- Other modules interact with inventory through events/contracts.

## Event Reactions
- `sales.invoice.confirmed` -> create `OUT` stock movements for confirmed sales invoice items.
- `purchasing.invoice.confirmed` -> create `IN` stock movements for confirmed purchase invoice items.
- Inventory does not mutate sales or purchasing data; it only records inventory-owned movements.

## Stock Balance Strategy
- `StockMovement` is append-only and represents every stock change.
- `StockBalance` is a read model derived from movement aggregation.
- No direct manual stock mutation is allowed; writes must be new stock movements.
