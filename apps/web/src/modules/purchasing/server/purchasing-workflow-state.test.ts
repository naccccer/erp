import assert from 'node:assert/strict';

import {
  createInitialPurchasingWorkflowState,
  parsePurchasingWorkflowState,
  serializePurchasingWorkflowState,
  type PurchasingWorkflowState,
} from './purchasing-workflow-state.ts';

const initialState = createInitialPurchasingWorkflowState();

assert.equal(initialState.draft_invoice, null);
assert.equal(initialState.confirmed_invoice, null);
assert.deepEqual(initialState.inventory_movements, []);
assert.equal(initialState.last_action_result, 'هیچ عملیاتی ثبت نشده است.');

const sampleState: PurchasingWorkflowState = {
  last_action_result: 'فاکتور تایید شد.',
  draft_invoice: {
    id: 'purchase-invoice-1002',
    tenant_id: 'default',
    supplier_id: 'supplier-1',
    invoice_date: '2026-03-10T00:00:00.000Z',
    status: 'Draft',
    total_amount: 1500000,
    items: [
      {
        id: 'item-1',
        tenant_id: 'default',
        invoice_id: 'purchase-invoice-1002',
        product_id: 'product-1',
        quantity: 3,
        unit_cost: 500000,
        line_total: 1500000,
      },
    ],
  },
  confirmed_invoice: null,
  inventory_movements: [],
};

assert.deepEqual(
  parsePurchasingWorkflowState(serializePurchasingWorkflowState(sampleState)),
  sampleState,
);
assert.deepEqual(parsePurchasingWorkflowState('not-json'), initialState);

console.log('purchasing-workflow-state tests passed');
