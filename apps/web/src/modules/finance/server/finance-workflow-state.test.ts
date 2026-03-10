import assert from 'node:assert/strict';

import {
  createInitialFinanceWorkflowState,
  parseFinanceWorkflowState,
  serializeFinanceWorkflowState,
  type FinanceWorkflowState,
} from './finance-workflow-state.ts';

const initialState = createInitialFinanceWorkflowState();

assert.equal(initialState.last_action_result, 'هیچ پرداختی ثبت نشده است.');
assert.equal(initialState.has_error, false);
assert.equal(initialState.last_registered_payment, null);

const sampleState: FinanceWorkflowState = {
  last_action_result: 'پرداخت با موفقیت ثبت شد.',
  has_error: false,
  last_registered_payment: {
    id: 'payment-1003',
    tenant_id: 'default',
    reference_type: 'purchase_invoice',
    reference_id: 'purchase-invoice-1002',
    amount: 1200000,
    paid_at: '2026-03-10T00:00:00.000Z',
    status: 'Registered',
  },
};

assert.deepEqual(parseFinanceWorkflowState(serializeFinanceWorkflowState(sampleState)), sampleState);
assert.deepEqual(parseFinanceWorkflowState('invalid-json'), initialState);

console.log('finance-workflow-state tests passed');

