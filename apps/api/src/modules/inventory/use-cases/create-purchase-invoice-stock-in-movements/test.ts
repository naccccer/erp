import assert from 'node:assert/strict';
import test from 'node:test';

import { PURCHASING_INVOICE_CONFIRMED_EVENT } from '../../../../../../../packages/contracts/src/events/purchasing.events.ts';
import { CreatePurchaseInvoiceStockInMovementsUseCase } from './use-case.ts';

test('creates IN stock movements from confirmed purchase invoice payload', () => {
  const useCase = new CreatePurchaseInvoiceStockInMovementsUseCase();

  const movements = useCase.execute({
    warehouse_id: 'warehouse-1',
    payload: {
      tenant_id: 'tenant-1',
      invoice_id: 'purchase-1',
      supplier_id: 'supplier-1',
      invoice_date: new Date('2026-03-07T08:00:00.000Z'),
      total_amount: 90,
      items: [
        {
          product_id: 'product-1',
          quantity: 3,
          unit_cost: 20,
          line_total: 60,
        },
        {
          product_id: 'product-2',
          quantity: 2,
          unit_cost: 15,
          line_total: 30,
        },
      ],
    },
  });

  assert.equal(movements.length, 2);
  assert.equal(movements[0].movement_type, 'IN');
  assert.equal(movements[0].tenant_id, 'tenant-1');
  assert.equal(movements[0].warehouse_id, 'warehouse-1');
  assert.equal(movements[0].product_id, 'product-1');
  assert.equal(movements[0].quantity, 3);
  assert.equal(movements[0].reference_type, PURCHASING_INVOICE_CONFIRMED_EVENT);
  assert.equal(movements[0].reference_id, 'purchase-1');
  assert.equal(
    movements[0].occurred_at.toISOString(),
    '2026-03-07T08:00:00.000Z',
  );

  assert.equal(movements[1].movement_type, 'IN');
  assert.equal(movements[1].product_id, 'product-2');
  assert.equal(movements[1].quantity, 2);
  assert.ok(movements[0].id.length > 0);
  assert.ok(movements[1].id.length > 0);
});
