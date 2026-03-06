import assert from 'node:assert/strict';
import test from 'node:test';

import {
  SALES_INVOICE_CANCELLED_EVENT,
  SALES_INVOICE_CONFIRMED_EVENT,
  type SalesInvoiceConfirmedEventContract,
} from '../../../../../../packages/contracts/src/events/sales.events.ts';
import { ConfirmSalesInvoiceUseCase } from '../../sales/use-cases/confirm-sales-invoice/use-case.ts';
import { CreateSalesInvoiceUseCase } from '../../sales/use-cases/create-sales-invoice/use-case.ts';
import { SalesInvoiceConfirmedInventoryEventHandler } from './sales-invoice-confirmed.handler.ts';

test('reacts to sales.invoice.confirmed and creates OUT stock movements', () => {
  const handler = new SalesInvoiceConfirmedInventoryEventHandler();

  const event: SalesInvoiceConfirmedEventContract = {
    name: SALES_INVOICE_CONFIRMED_EVENT,
    payload: {
      tenant_id: 'tenant-1',
      invoice_id: 'invoice-1',
      customer_id: 'customer-1',
      invoice_date: new Date('2026-03-06T08:00:00.000Z'),
      total_amount: 240,
      items: [
        {
          product_id: 'product-1',
          quantity: 2,
          unit_price: 100,
          discount: 10,
          line_total: 190,
        },
      ],
    },
  };

  const movements = handler.execute({
    event,
    warehouse_id: 'warehouse-1',
  });

  assert.equal(movements.length, 1);
  assert.equal(movements[0].movement_type, 'OUT');
  assert.equal(movements[0].tenant_id, 'tenant-1');
  assert.equal(movements[0].warehouse_id, 'warehouse-1');
  assert.equal(movements[0].product_id, 'product-1');
  assert.equal(movements[0].quantity, 2);
  assert.equal(movements[0].reference_type, SALES_INVOICE_CONFIRMED_EVENT);
  assert.equal(movements[0].reference_id, 'invoice-1');
});

test('covers CreateSalesInvoice -> ConfirmSalesInvoice -> event -> inventory OUT movement flow', () => {
  const createSalesInvoice = new CreateSalesInvoiceUseCase();
  const confirmSalesInvoice = new ConfirmSalesInvoiceUseCase();
  const inventoryHandler = new SalesInvoiceConfirmedInventoryEventHandler();

  const draftInvoice = createSalesInvoice.execute({
    tenant_id: 'tenant-1',
    customer_id: 'customer-1',
    invoice_date: new Date('2026-03-06T08:00:00.000Z'),
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

  const confirmed = confirmSalesInvoice.execute({ invoice: draftInvoice });
  const movements = inventoryHandler.execute({
    event: confirmed.events[0],
    warehouse_id: 'warehouse-1',
  });

  assert.equal(confirmed.invoice.status, 'Confirmed');
  assert.equal(confirmed.events[0].name, SALES_INVOICE_CONFIRMED_EVENT);
  assert.equal(movements.length, 2);
  assert.equal(movements[0].movement_type, 'OUT');
  assert.equal(movements[1].movement_type, 'OUT');
  assert.equal(movements[0].reference_type, SALES_INVOICE_CONFIRMED_EVENT);
  assert.equal(movements[1].reference_type, SALES_INVOICE_CONFIRMED_EVENT);
  assert.equal(movements[0].reference_id, confirmed.invoice.id);
  assert.equal(movements[1].reference_id, confirmed.invoice.id);
});

test('throws for unsupported sales event name', () => {
  const handler = new SalesInvoiceConfirmedInventoryEventHandler();

  const unsupportedEvent = {
    name: SALES_INVOICE_CANCELLED_EVENT,
    payload: {
      tenant_id: 'tenant-1',
      invoice_id: 'invoice-1',
      customer_id: 'customer-1',
      invoice_date: new Date('2026-03-06T08:00:00.000Z'),
      total_amount: 240,
      items: [],
    },
  } as unknown as SalesInvoiceConfirmedEventContract;

  assert.throws(
    () =>
      handler.execute({
        event: unsupportedEvent,
        warehouse_id: 'warehouse-1',
      }),
    /Unsupported sales event for inventory handler\./,
  );
});
