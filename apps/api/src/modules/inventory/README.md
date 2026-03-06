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
