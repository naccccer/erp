import type { PurchaseInvoice } from '../../entities/purchase-invoice.entity.ts';

export interface ConfirmPurchaseInvoiceDto {
  invoice: PurchaseInvoice;
}
