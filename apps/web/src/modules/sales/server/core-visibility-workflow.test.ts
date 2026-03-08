import assert from 'node:assert/strict';
import test from 'node:test';

import { SALES_INVOICE_CONFIRMED_EVENT } from '../../../../../../packages/contracts/src/events/sales.events.ts';
import {
  coreVisibilityWorkflow,
  DEFAULT_WAREHOUSE_ID,
  resetCoreVisibilityWorkflowState,
} from './core-visibility-workflow.ts';

test('creates a draft sales invoice through the visibility workflow', () => {
  resetCoreVisibilityWorkflowState();

  const draftInvoice = coreVisibilityWorkflow.createDraftSalesInvoice({
    tenant_id: 'tenant-1',
    customer_id: 'customer-1',
    invoice_date: new Date('2026-03-07T00:00:00.000Z'),
    product_id: 'product-1',
    quantity: 2,
    unit_price: 100,
    discount: 10,
  });

  const views = coreVisibilityWorkflow.listInvoiceViews();

  assert.equal(draftInvoice.status, 'Draft');
  assert.equal(draftInvoice.total_amount, 190);
  assert.equal(views.length, 1);
  assert.equal(views[0].invoice.id, draftInvoice.id);
  assert.equal(views[0].stock_movements.length, 0);
});

test('confirms a draft invoice and exposes resulting OUT stock movement', () => {
  resetCoreVisibilityWorkflowState();

  const draftInvoice = coreVisibilityWorkflow.createDraftSalesInvoice({
    tenant_id: 'tenant-1',
    customer_id: 'customer-1',
    invoice_date: new Date('2026-03-07T00:00:00.000Z'),
    product_id: 'product-2',
    quantity: 3,
    unit_price: 50,
    discount: 0,
  });

  const confirmedView = coreVisibilityWorkflow.confirmDraftSalesInvoice({
    invoice_id: draftInvoice.id,
  });

  const views = coreVisibilityWorkflow.listInvoiceViews();

  assert.equal(confirmedView.invoice.status, 'Confirmed');
  assert.equal(confirmedView.stock_movements.length, 1);
  assert.equal(confirmedView.stock_movements[0].movement_type, 'OUT');
  assert.equal(confirmedView.stock_movements[0].warehouse_id, DEFAULT_WAREHOUSE_ID);
  assert.equal(confirmedView.stock_movements[0].reference_type, SALES_INVOICE_CONFIRMED_EVENT);
  assert.equal(confirmedView.stock_movements[0].reference_id, confirmedView.invoice.id);

  assert.equal(views[0].invoice.status, 'Confirmed');
  assert.equal(views[0].stock_movements.length, 1);
});
