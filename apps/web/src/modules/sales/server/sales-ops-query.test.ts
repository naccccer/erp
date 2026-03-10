import assert from 'node:assert/strict';

import type { SalesInvoiceDto } from './sales-api';
import {
  applySalesOpsList,
  buildSalesOpsHref,
  readSalesOpsQuery,
  type SalesOpsQueryState,
} from './sales-ops-query.ts';

function makeInvoice(
  id: string,
  status: SalesInvoiceDto['status'],
  customerId: string,
  invoiceDate: string,
  totalAmount: number,
): SalesInvoiceDto {
  return {
    id,
    tenant_id: 'default',
    customer_id: customerId,
    invoice_date: invoiceDate,
    status,
    total_amount: totalAmount,
    items: [],
  };
}

const parsed = readSalesOpsQuery({
  tenant_id: 'tenant-a',
  status: 'Confirmed',
  sort_by: 'total_amount',
  sort_direction: 'asc',
  page: '0',
  page_size: '999',
  selected_invoice_id: 'sales-invoice-1002',
});

assert.equal(parsed.tenantId, 'tenant-a');
assert.equal(parsed.statusFilter, 'Confirmed');
assert.equal(parsed.sortBy, 'total_amount');
assert.equal(parsed.sortDirection, 'asc');
assert.equal(parsed.page, 1);
assert.equal(parsed.pageSize, 10);
assert.equal(parsed.selectedInvoiceId, 'sales-invoice-1002');

const invoices: SalesInvoiceDto[] = [
  makeInvoice('sales-invoice-1006', 'Draft', 'customer-a', '2026-03-01T00:00:00.000Z', 900),
  makeInvoice('sales-invoice-1005', 'Confirmed', 'customer-b', '2026-03-05T00:00:00.000Z', 700),
  makeInvoice('sales-invoice-1004', 'Confirmed', 'customer-b', '2026-03-04T00:00:00.000Z', 500),
  makeInvoice('sales-invoice-1003', 'Confirmed', 'customer-b', '2026-03-03T00:00:00.000Z', 400),
  makeInvoice('sales-invoice-1002', 'Confirmed', 'customer-b', '2026-03-02T00:00:00.000Z', 300),
  makeInvoice('sales-invoice-1001', 'Confirmed', 'customer-b', '2026-03-01T00:00:00.000Z', 200),
  makeInvoice('sales-invoice-1000', 'Confirmed', 'customer-b', '2026-02-28T00:00:00.000Z', 100),
];

const query: SalesOpsQueryState = {
  tenantId: 'default',
  invoiceIdFilter: '',
  customerIdFilter: 'customer-b',
  statusFilter: 'Confirmed',
  sortBy: 'invoice_date',
  sortDirection: 'desc',
  page: 1,
  pageSize: 5,
  selectedInvoiceId: 'sales-invoice-1005',
};

const listed = applySalesOpsList(invoices, query);

assert.equal(listed.totalCount, 6);
assert.equal(listed.totalPages, 2);
assert.equal(listed.currentPage, 1);
assert.equal(listed.pagedInvoices.length, 5);
assert.equal(listed.pagedInvoices[0].id, 'sales-invoice-1005');

const pageTwo = applySalesOpsList(invoices, {
  ...query,
  page: 2,
});

assert.equal(pageTwo.pagedInvoices.length, 1);
assert.equal(pageTwo.pagedInvoices[0].id, 'sales-invoice-1000');

const href = buildSalesOpsHref(
  {
    ...query,
    page: 2,
  },
  {
    page: 1,
    sortDirection: 'asc',
  },
);

assert.match(href, /^\/sales\?/);
assert.ok(href.includes('tenant_id=default'));
assert.ok(href.includes('status=Confirmed'));
assert.ok(href.includes('sort_direction=asc'));
assert.ok(href.includes('page=1'));

console.log('sales-ops-query tests passed');
