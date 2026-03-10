import assert from 'node:assert/strict';
import test from 'node:test';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type { PurchaseInvoice } from '../../entities/purchase-invoice.entity.ts';
import type { IPurchaseInvoiceRepository } from '../../infra/purchase-invoice.repository.ts';
import { ConfirmPurchaseInvoiceUseCase } from './use-case.ts';

function makeInvoice(status: PurchaseInvoice['status']): PurchaseInvoice {
  return {
    id: 'purchase-1',
    tenant_id: 'tenant-1',
    supplier_id: 'supplier-1',
    invoice_date: new Date('2026-03-07'),
    status,
    total_amount: 90,
    items: [
      {
        id: 'line-1',
        tenant_id: 'tenant-1',
        invoice_id: 'purchase-1',
        product_id: 'product-1',
        quantity: 3,
        unit_cost: 20,
        line_total: 60,
      },
      {
        id: 'line-2',
        tenant_id: 'tenant-1',
        invoice_id: 'purchase-1',
        product_id: 'product-2',
        quantity: 2,
        unit_cost: 15,
        line_total: 30,
      },
    ],
  };
}

function makeRepository(): IPurchaseInvoiceRepository {
  return {
    create: async (invoice: PurchaseInvoice) => invoice,
    update: async (invoice: PurchaseInvoice) => invoice,
  };
}

test('confirms a draft purchase invoice, persists it, and emits purchasing.invoice.confirmed', async () => {
  const eventEmitter = new EventEmitter2();
  let emittedInvoiceId = '';

  eventEmitter.on('purchasing.invoice.confirmed', (payload: { invoice_id: string }) => {
    emittedInvoiceId = payload.invoice_id;
  });

  const useCase = new ConfirmPurchaseInvoiceUseCase(makeRepository(), eventEmitter);

  const result = await useCase.execute({ invoice: makeInvoice('Draft') });

  assert.equal(result.invoice.status, 'Confirmed');
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].name, 'purchasing.invoice.confirmed');
  assert.equal(result.events[0].payload.tenant_id, 'tenant-1');
  assert.equal(result.events[0].payload.invoice_id, 'purchase-1');
  assert.equal(result.events[0].payload.items.length, 2);
  assert.equal(result.events[0].payload.items[0].product_id, 'product-1');
  assert.equal(result.events[0].payload.items[0].quantity, 3);
  assert.equal(emittedInvoiceId, 'purchase-1');
});

test('throws when purchase invoice is already confirmed', async () => {
  const useCase = new ConfirmPurchaseInvoiceUseCase(makeRepository(), new EventEmitter2());

  await assert.rejects(
    () => useCase.execute({ invoice: makeInvoice('Confirmed') }),
    /Only draft purchase invoices can be confirmed\./,
  );
});

test('throws when purchase invoice is cancelled', async () => {
  const useCase = new ConfirmPurchaseInvoiceUseCase(makeRepository(), new EventEmitter2());

  await assert.rejects(
    () => useCase.execute({ invoice: makeInvoice('Cancelled') }),
    /Only draft purchase invoices can be confirmed\./,
  );
});
