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
- `sales.invoice.confirmed` -> `@OnEvent` handler resolves tenant default warehouse and persists `OUT` stock movements.
- `purchasing.invoice.confirmed` -> `@OnEvent` handler resolves tenant default warehouse and persists `IN` stock movements.
- Inventory does not mutate sales or purchasing data; it only records inventory-owned movements.

## Stock Balance Strategy
- `StockMovement` is append-only and represents every stock change.
- `StockBalance` is a read model derived from movement aggregation.
- No direct manual stock mutation is allowed; writes must be new stock movements.

## Nest Wiring (Phase 21)
- `InventoryModule` registers:
  - `PrismaStockMovementRepository`
  - `IStockMovementRepository` token -> `PrismaStockMovementRepository`
  - `PrismaWarehouseRepository`
  - `IWarehouseRepository` token -> `PrismaWarehouseRepository`
  - `CreateSalesInvoiceStockOutMovementsUseCase`
  - `CreatePurchaseInvoiceStockInMovementsUseCase`
  - `SalesInvoiceConfirmedInventoryEventHandler`
  - `PurchasingInvoiceConfirmedInventoryEventHandler`
