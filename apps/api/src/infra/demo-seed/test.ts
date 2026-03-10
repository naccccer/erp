import assert from 'node:assert/strict';

import { buildDemoDataset, DEMO_TENANT_ID } from './demo-dataset.ts';

const datasetA = buildDemoDataset();
const datasetB = buildDemoDataset();

assert.deepEqual(datasetA, datasetB);

const productIds = new Set(datasetA.products.map((product) => product.id));
const customerIds = new Set(datasetA.customers.map((customer) => customer.id));
const supplierIds = new Set(datasetA.suppliers.map((supplier) => supplier.id));
const salesInvoiceIds = new Set(datasetA.sales_invoices.map((invoice) => invoice.id));
const purchaseInvoiceIds = new Set(datasetA.purchase_invoices.map((invoice) => invoice.id));

assert.ok(productIds.has('product-1'));
assert.ok(customerIds.has('customer-1'));
assert.ok(supplierIds.has('supplier-1'));

for (const invoice of datasetA.sales_invoices) {
  assert.equal(invoice.tenant_id, DEMO_TENANT_ID);
  assert.ok(customerIds.has(invoice.customer_id));
  for (const item of invoice.items) {
    assert.ok(productIds.has(item.product_id));
  }
}

for (const invoice of datasetA.purchase_invoices) {
  assert.equal(invoice.tenant_id, DEMO_TENANT_ID);
  assert.ok(supplierIds.has(invoice.supplier_id));
  for (const item of invoice.items) {
    assert.ok(productIds.has(item.product_id));
  }
}

for (const movement of datasetA.stock_movements) {
  if (!movement.reference_id) {
    continue;
  }

  if (movement.reference_type === 'purchasing.invoice.confirmed') {
    assert.ok(purchaseInvoiceIds.has(movement.reference_id));
  }

  if (movement.reference_type === 'sales.invoice.confirmed') {
    assert.ok(salesInvoiceIds.has(movement.reference_id));
  }
}

console.log('demo seed dataset test passed');
