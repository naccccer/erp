import assert from 'node:assert/strict';
import test from 'node:test';

import type { RegisterPaymentUseCase } from '../use-cases/register-payment/use-case.ts';
import { PaymentController } from './payment.controller.ts';

test('registers payment through use case', async () => {
  const registerPaymentUseCase = {
    execute: async () => ({
      id: 'payment-1',
      tenant_id: 'tenant-1',
      reference_type: 'sales.invoice',
      reference_id: 'invoice-1',
      amount: 120,
      paid_at: new Date('2026-03-09T10:00:00.000Z'),
      status: 'Registered',
    }),
  } as unknown as RegisterPaymentUseCase;
  const controller = new PaymentController(registerPaymentUseCase);

  const result = await controller.create({
    tenant_id: 'tenant-1',
    reference_type: 'sales.invoice',
    reference_id: 'invoice-1',
    amount: 120,
    paid_at: new Date('2026-03-09T10:00:00.000Z'),
  });

  assert.equal(result.id, 'payment-1');
  assert.equal(result.status, 'Registered');
});
