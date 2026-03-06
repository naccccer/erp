import assert from 'node:assert/strict';
import test from 'node:test';

import { CreateSalesInvoiceUseCase } from './use-case';

test('creates a draft sales invoice and calculates totals', () => {
  const useCase = new CreateSalesInvoiceUseCase();

  const invoice = useCase.execute({
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
