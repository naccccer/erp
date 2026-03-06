import assert from 'node:assert/strict';
import test from 'node:test';

import { RegisterPaymentUseCase } from './use-case.ts';

test('registers a payment record', () => {
  const useCase = new RegisterPaymentUseCase();

  const payment = useCase.execute({
    tenant_id: 'tenant-1',
    reference_type: 'sales.invoice.confirmed',
    reference_id: 'invoice-1',
    amount: 240,
    paid_at: new Date('2026-03-07T10:00:00.000Z'),
  });

  assert.equal(payment.tenant_id, 'tenant-1');
  assert.equal(payment.reference_type, 'sales.invoice.confirmed');
  assert.equal(payment.reference_id, 'invoice-1');
  assert.equal(payment.amount, 240);
  assert.equal(payment.status, 'Registered');
  assert.equal(payment.paid_at.toISOString(), '2026-03-07T10:00:00.000Z');
  assert.ok(payment.id.length > 0);
});
