import type { SalesInvoice } from '../entities/sales-invoice.entity';

export const SALES_INVOICE_REPOSITORY = Symbol('ISalesInvoiceRepository');

export interface ISalesInvoiceRepository {
  create(invoice: SalesInvoice): Promise<SalesInvoice>;
  update(invoice: SalesInvoice): Promise<SalesInvoice>;
  findById(id: string, tenantId: string): Promise<SalesInvoice | null>;
  listByTenant(tenantId: string): Promise<SalesInvoice[]>;
}
