import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PURCHASING_INVOICE_CONFIRMED_EVENT,
  type PurchasingInvoiceConfirmedEventContract,
} from '../../../../../../packages/contracts/src/events/purchasing.events.ts';
import { PurchasingInvoiceConfirmedInventoryEventHandler } from './purchasing-invoice-confirmed.handler.ts';

test('reacts to purchasing.invoice.confirmed and creates IN stock movements', () => {
  const handler = new PurchasingInvoiceConfirmedInventoryEventHandler();

  const event: PurchasingInvoiceConfirmedEventContract = {
    name: PURCHASING_INVOICE_CONFIRMED_EVENT,
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
      ],
    },
  };

  const movements = handler.execute({
    event,
    warehouse_id: 'warehouse-1',
  });

  assert.equal(movements.length, 1);
  assert.equal(movements[0].movement_type, 'IN');
  assert.equal(movements[0].tenant_id, 'tenant-1');
  assert.equal(movements[0].warehouse_id, 'warehouse-1');
  assert.equal(movements[0].product_id, 'product-1');
  assert.equal(movements[0].quantity, 3);
  assert.equal(movements[0].reference_type, PURCHASING_INVOICE_CONFIRMED_EVENT);
  assert.equal(movements[0].reference_id, 'purchase-1');
});
