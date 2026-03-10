import assert from 'node:assert/strict';
import test from 'node:test';

import type { PurchaseInvoice } from '../../entities/purchase-invoice.entity.ts';
import type { IPurchaseInvoiceRepository } from '../../infra/purchase-invoice.repository.ts';
import { CreatePurchaseInvoiceUseCase } from './use-case.ts';

test('creates a draft purchase invoice, persists it, and calculates totals', async () => {
  let createdInvoice: PurchaseInvoice | null = null;
  const repository: IPurchaseInvoiceRepository = {
    create: async (invoice: PurchaseInvoice) => {
      createdInvoice = invoice;
      return invoice;
    },
    update: async (invoice: PurchaseInvoice) => invoice,
  };
  const useCase = new CreatePurchaseInvoiceUseCase(repository);

  const invoice = await useCase.execute({
    tenant_id: 'tenant-1',
    supplier_id: 'supplier-1',
    invoice_date: new Date('2026-03-07'),
    items: [
      {
        product_id: 'product-1',
        quantity: 3,
        unit_cost: 20,
      },
      {
        product_id: 'product-2',
        quantity: 2,
        unit_cost: 15,
      },
    ],
  });

  assert.equal(invoice.status, 'Draft');
  assert.equal(invoice.items.length, 2);
  assert.equal(invoice.items[0].line_total, 60);
  assert.equal(invoice.items[1].line_total, 30);
  assert.equal(invoice.total_amount, 90);
  assert.equal(createdInvoice?.id, invoice.id);
});
