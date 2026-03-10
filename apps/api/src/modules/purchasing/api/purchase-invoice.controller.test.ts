import assert from 'node:assert/strict';
import test from 'node:test';
import { BadRequestException } from '@nestjs/common';

import type { PurchaseInvoice } from '../entities/purchase-invoice.entity.ts';
import type { ConfirmPurchaseInvoiceUseCase } from '../use-cases/confirm-purchase-invoice/use-case.ts';
import type { CreatePurchaseInvoiceUseCase } from '../use-cases/create-purchase-invoice/use-case.ts';
import { PurchaseInvoiceController } from './purchase-invoice.controller.ts';

function makeInvoice(id: string): PurchaseInvoice {
  return {
    id,
    tenant_id: 'tenant-1',
    supplier_id: 'supplier-1',
    invoice_date: new Date('2026-03-09T08:00:00.000Z'),
    status: 'Draft',
    total_amount: 80,
    items: [],
  };
}

test('creates purchase invoice through use case', async () => {
  const createUseCase = {
    execute: async () => makeInvoice('purchase-1'),
  } as unknown as CreatePurchaseInvoiceUseCase;
  const confirmUseCase = {
    execute: async () => ({
      invoice: { ...makeInvoice('purchase-1'), status: 'Confirmed' as const },
      events: [],
    }),
  } as unknown as ConfirmPurchaseInvoiceUseCase;
  const controller = new PurchaseInvoiceController(createUseCase, confirmUseCase);

  const result = await controller.create({
    tenant_id: 'tenant-1',
    supplier_id: 'supplier-1',
    invoice_date: new Date('2026-03-09T08:00:00.000Z'),
    items: [],
  });

  assert.equal(result.id, 'purchase-1');
});

test('confirms purchase invoice through use case', async () => {
  const createUseCase = {
    execute: async () => makeInvoice('purchase-1'),
  } as unknown as CreatePurchaseInvoiceUseCase;
  const confirmUseCase = {
    execute: async () => ({
      invoice: { ...makeInvoice('purchase-1'), status: 'Confirmed' as const },
      events: [],
    }),
  } as unknown as ConfirmPurchaseInvoiceUseCase;
  const controller = new PurchaseInvoiceController(createUseCase, confirmUseCase);

  const result = await controller.confirm('purchase-1', {
    invoice: makeInvoice('purchase-1'),
  });

  assert.equal(result.invoice.status, 'Confirmed');
});

test('throws when confirm path id does not match invoice id', async () => {
  const createUseCase = {
    execute: async () => makeInvoice('purchase-1'),
  } as unknown as CreatePurchaseInvoiceUseCase;
  const confirmUseCase = {
    execute: async () => ({
      invoice: { ...makeInvoice('purchase-1'), status: 'Confirmed' as const },
      events: [],
    }),
  } as unknown as ConfirmPurchaseInvoiceUseCase;
  const controller = new PurchaseInvoiceController(createUseCase, confirmUseCase);

  await assert.rejects(
    () =>
      controller.confirm('purchase-2', {
        invoice: makeInvoice('purchase-1'),
      }),
    (error: unknown) =>
      error instanceof BadRequestException &&
      error.message === 'Path id must match body.invoice.id.',
  );
});
