import assert from 'node:assert/strict';
import test from 'node:test';

import type { SalesInvoice } from '../../entities/sales-invoice.entity';
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

test('confirms a draft sales invoice and prepares sales.invoice.confirmed event', () => {
  const useCase = new ConfirmSalesInvoiceUseCase();

  const result = useCase.execute({ invoice: makeInvoice('Draft') });

  assert.equal(result.invoice.status, 'Confirmed');
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].name, 'sales.invoice.confirmed');
  assert.equal(result.events[0].payload.tenant_id, 'tenant-1');
  assert.equal(result.events[0].payload.invoice_id, 'invoice-1');
  assert.equal(result.events[0].payload.items.length, 2);
  assert.equal(result.events[0].payload.items[0].product_id, 'product-1');
  assert.equal(result.events[0].payload.items[0].quantity, 2);
});

test('throws when invoice is already confirmed', () => {
  const useCase = new ConfirmSalesInvoiceUseCase();

  assert.throws(
    () => useCase.execute({ invoice: makeInvoice('Confirmed') }),
    /Only draft sales invoices can be confirmed\./,
  );
});

test('throws when invoice is cancelled', () => {
  const useCase = new ConfirmSalesInvoiceUseCase();

  assert.throws(
    () => useCase.execute({ invoice: makeInvoice('Cancelled') }),
    /Only draft sales invoices can be confirmed\./,
  );
});
