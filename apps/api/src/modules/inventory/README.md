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

## Event Handler Pattern (Phase 23.5)
- Handler registration is explicit and event-name based through `defineDomainEventHandlerRegistration`.
- Unsupported event names are rejected through `assertSupportedEventName`.
- Stock movement side effects are wrapped in `withStockMovementIdempotencyGuard`.
- Idempotency key uses event name + `reference_id` + `tenant_id` derived from payload.
- Handlers must be order-independent and safe under duplicate delivery.

## HTTP API (Phase 23)
- `GET /inventory/movements?invoiceId=...` -> returns read-only stock movements linked to a confirmed invoice.

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

## Event Hardening (Phase 24)
- Duplicate delivery is absorbed by idempotency checks on `reference_id` + event name + tenant scope before persisting.
- Publisher-side failures are isolated per listener, so one failing consumer does not block other listeners.
- Publisher logs are structured with `event_name`, `payload_summary`, `handler_index`, and `handler_outcome`.
- Inventory handlers also emit structured success/failure logs with `handler_name` and payload summary fields.

## Negative Stock Guard (Phase 25)
- `CreateSalesInvoiceStockOutMovementsUseCase` queries available stock from inventory infra before creating each `OUT` movement.
- Available stock is calculated from `StockMovement` aggregates (`IN` - `OUT`), with no separate balance table.
- If requested quantity exceeds available quantity, `InsufficientStockError` is thrown and no new movements are persisted for that sales confirmation attempt.
