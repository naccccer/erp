import type { PurchaseInvoice } from '../entities/purchase-invoice.entity.ts';

export const PURCHASE_INVOICE_REPOSITORY = Symbol('IPurchaseInvoiceRepository');

export interface IPurchaseInvoiceRepository {
  create(invoice: PurchaseInvoice): Promise<PurchaseInvoice>;
  update(invoice: PurchaseInvoice): Promise<PurchaseInvoice>;
}
