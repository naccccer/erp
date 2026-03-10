import assert from 'node:assert/strict';

import {
  createInitialInventoryLookupState,
  parseInventoryLookupState,
  serializeInventoryLookupState,
  type InventoryLookupState,
} from './inventory-lookup-state.ts';

const initialState = createInitialInventoryLookupState();

assert.equal(initialState.tenant_id, 'default');
assert.equal(initialState.reference_id, 'purchase-invoice-1001');
assert.equal(initialState.last_action_result, 'هنوز جستجویی انجام نشده است.');
assert.equal(initialState.last_action_status, 'idle');
assert.equal(initialState.has_error, false);
assert.deepEqual(initialState.movements, []);

const sampleState: InventoryLookupState = {
  tenant_id: 'default',
  reference_id: 'purchase-invoice-1001',
  last_action_result: '۲ حرکت انبار یافت شد.',
  last_action_status: 'success',
  has_error: false,
  movements: [
    {
      id: 'movement-1',
      tenant_id: 'default',
      warehouse_id: 'warehouse-main',
      product_id: 'product-1',
      movement_type: 'IN',
      quantity: 10,
      occurred_at: '2026-03-10T00:00:00.000Z',
      reference_type: 'purchasing.invoice.confirmed',
      reference_id: 'purchase-invoice-1001',
    },
  ],
};

assert.deepEqual(
  parseInventoryLookupState(serializeInventoryLookupState(sampleState)),
  sampleState,
);
assert.deepEqual(parseInventoryLookupState('invalid-json'), initialState);
assert.equal(parseInventoryLookupState('{"last_action_status":"invalid"}').last_action_status, 'idle');

console.log('inventory-lookup-state tests passed');
