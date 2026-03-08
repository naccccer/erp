import assert from 'node:assert/strict';
import test from 'node:test';
import { EventEmitter2 } from '@nestjs/event-emitter';

import type { SalesInvoice } from '../../entities/sales-invoice.entity';
import type { ISalesInvoiceRepository } from '../../infra/sales-invoice.repository';
import { ConfirmSalesInvoiceUseCase } from './use-case';

function makeInvoice(status: SalesInvoice['status']): SalesInvoice {
  return {
    id: 'invoice-1',
    tenant_id: 'tenant-1',
    customer_id: 'customer-1',
    invoice_date: new Date('2026-03-06'),
    status,
    total_amount: 240,
    items: [
      {
        id: 'line-1',
        tenant_id: 'tenant-1',
        invoice_id: 'invoice-1',
        product_id: 'product-1',
        quantity: 2,
        unit_price: 100,
        discount: 10,
        line_total: 190,
      },
      {
        id: 'line-2',
        tenant_id: 'tenant-1',
        invoice_id: 'invoice-1',
        product_id: 'product-2',
        quantity: 1,
        unit_price: 50,
        discount: 0,
        line_total: 50,
      },
    ],
  };
}

test('confirms a draft sales invoice, persists it, and emits sales.invoice.confirmed', async () => {
  const repository: ISalesInvoiceRepository = {
    create: async (invoice: SalesInvoice) => invoice,
    update: async (invoice: SalesInvoice) => invoice,
    findById: async () => null,
    listByTenant: async () => [],
  };
  const eventEmitter = new EventEmitter2();
  let emittedEventName = '';
  let emittedPayloadInvoiceId = '';

  eventEmitter.on('sales.invoice.confirmed', (payload: { invoice_id: string }) => {
    emittedEventName = 'sales.invoice.confirmed';
    emittedPayloadInvoiceId = payload.invoice_id;
  });

  const useCase = new ConfirmSalesInvoiceUseCase(repository, eventEmitter);

  const result = await useCase.execute({ invoice: makeInvoice('Draft') });

  assert.equal(result.invoice.status, 'Confirmed');
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].name, 'sales.invoice.confirmed');
  assert.equal(result.events[0].payload.tenant_id, 'tenant-1');
  assert.equal(result.events[0].payload.invoice_id, 'invoice-1');
  assert.equal(result.events[0].payload.items.length, 2);
  assert.equal(result.events[0].payload.items[0].product_id, 'product-1');
  assert.equal(result.events[0].payload.items[0].quantity, 2);
  assert.equal(emittedEventName, 'sales.invoice.confirmed');
  assert.equal(emittedPayloadInvoiceId, 'invoice-1');
});

test('throws when invoice is already confirmed', async () => {
  const repository: ISalesInvoiceRepository = {
    create: async (invoice: SalesInvoice) => invoice,
    update: async (invoice: SalesInvoice) => invoice,
    findById: async () => null,
    listByTenant: async () => [],
  };
  const useCase = new ConfirmSalesInvoiceUseCase(repository, new EventEmitter2());

  await assert.rejects(
    () => useCase.execute({ invoice: makeInvoice('Confirmed') }),
    /Only draft sales invoices can be confirmed\./,
  );
});

test('throws when invoice is cancelled', async () => {
  const repository: ISalesInvoiceRepository = {
    create: async (invoice: SalesInvoice) => invoice,
    update: async (invoice: SalesInvoice) => invoice,
    findById: async () => null,
    listByTenant: async () => [],
  };
  const useCase = new ConfirmSalesInvoiceUseCase(repository, new EventEmitter2());

  await assert.rejects(
    () => useCase.execute({ invoice: makeInvoice('Cancelled') }),
    /Only draft sales invoices can be confirmed\./,
  );
});
