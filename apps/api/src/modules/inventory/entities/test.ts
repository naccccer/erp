import assert from 'node:assert/strict';
import test from 'node:test';

import { buildStockBalancesFromMovements } from './stock-balance.read-model.ts';
import type { StockMovement } from './stock-movement.entity.ts';

test('builds stock balance from stock movements', () => {
  const movements: StockMovement[] = [
    {
      id: 'movement-1',
      tenant_id: 'tenant-1',
      warehouse_id: 'warehouse-1',
      product_id: 'product-1',
      movement_type: 'IN',
      quantity: 10,
      occurred_at: new Date('2026-03-06'),
      reference_type: 'purchase.invoice.confirmed',
      reference_id: 'purchase-1',
    },
    {
      id: 'movement-2',
      tenant_id: 'tenant-1',
      warehouse_id: 'warehouse-1',
      product_id: 'product-1',
      movement_type: 'OUT',
      quantity: 3,
      occurred_at: new Date('2026-03-06'),
      reference_type: 'sales.invoice.confirmed',
      reference_id: 'sales-1',
    },
  ];

  const balances = buildStockBalancesFromMovements(movements);

  assert.equal(balances.length, 1);
  assert.equal(balances[0].tenant_id, 'tenant-1');
  assert.equal(balances[0].warehouse_id, 'warehouse-1');
  assert.equal(balances[0].product_id, 'product-1');
  assert.equal(balances[0].quantity_on_hand, 7);
});

test('keeps balances isolated by tenant, warehouse, and product', () => {
  const movements: StockMovement[] = [
    {
      id: 'movement-1',
      tenant_id: 'tenant-1',
      warehouse_id: 'warehouse-1',
      product_id: 'product-1',
      movement_type: 'IN',
      quantity: 5,
      occurred_at: new Date('2026-03-06'),
    },
    {
      id: 'movement-2',
      tenant_id: 'tenant-1',
      warehouse_id: 'warehouse-2',
      product_id: 'product-1',
      movement_type: 'IN',
      quantity: 4,
      occurred_at: new Date('2026-03-06'),
    },
    {
      id: 'movement-3',
      tenant_id: 'tenant-2',
      warehouse_id: 'warehouse-1',
      product_id: 'product-1',
      movement_type: 'IN',
      quantity: 3,
      occurred_at: new Date('2026-03-06'),
    },
    {
      id: 'movement-4',
      tenant_id: 'tenant-1',
      warehouse_id: 'warehouse-1',
      product_id: 'product-2',
      movement_type: 'IN',
      quantity: 2,
      occurred_at: new Date('2026-03-06'),
    },
  ];

  const balances = buildStockBalancesFromMovements(movements);

  assert.equal(balances.length, 4);
  assert.deepEqual(
    balances.map((balance) => ({
      tenant_id: balance.tenant_id,
      warehouse_id: balance.warehouse_id,
      product_id: balance.product_id,
      quantity_on_hand: balance.quantity_on_hand,
    })),
    [
      {
        tenant_id: 'tenant-1',
        warehouse_id: 'warehouse-1',
        product_id: 'product-1',
        quantity_on_hand: 5,
      },
      {
        tenant_id: 'tenant-1',
        warehouse_id: 'warehouse-1',
        product_id: 'product-2',
        quantity_on_hand: 2,
      },
      {
        tenant_id: 'tenant-1',
        warehouse_id: 'warehouse-2',
        product_id: 'product-1',
        quantity_on_hand: 4,
      },
      {
        tenant_id: 'tenant-2',
        warehouse_id: 'warehouse-1',
        product_id: 'product-1',
        quantity_on_hand: 3,
      },
    ],
  );
});
