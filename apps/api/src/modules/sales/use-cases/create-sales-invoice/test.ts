import assert from 'node:assert/strict';
import test from 'node:test';

import type { SalesInvoice } from '../../entities/sales-invoice.entity';
import type { ISalesInvoiceRepository } from '../../infra/sales-invoice.repository';
import { CreateSalesInvoiceUseCase } from './use-case';

test('creates a draft sales invoice, persists it, and calculates totals', async () => {
  const repository: ISalesInvoiceRepository = {
    create: async (invoice: SalesInvoice) => invoice,
    update: async (invoice: SalesInvoice) => invoice,
    findById: async () => null,
    listByTenant: async () => [],
  };
  const useCase = new CreateSalesInvoiceUseCase(repository);

  const invoice = await useCase.execute({
    tenant_id: 'tenant-1',
    customer_id: 'customer-1',
    invoice_date: new Date('2026-03-06'),
    items: [
      {
        product_id: 'product-1',
        quantity: 2,
        unit_price: 100,
        discount: 10,
      },
      {
        product_id: 'product-2',
        quantity: 1,
        unit_price: 50,
      },
    ],
  });

  assert.equal(invoice.status, 'Draft');
  assert.equal(invoice.items.length, 2);
  assert.equal(invoice.items[0].line_total, 190);
  assert.equal(invoice.items[1].line_total, 50);
  assert.equal(invoice.total_amount, 240);
});
