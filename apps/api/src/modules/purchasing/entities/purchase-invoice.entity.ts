import type { PurchaseInvoiceItem } from './purchase-invoice-item.entity.ts';

export type PurchaseInvoiceStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface PurchaseInvoice {
  id: string;
  tenant_id: string;
  supplier_id: string;
  invoice_date: Date;
  status: PurchaseInvoiceStatus;
  total_amount: number;
  items: PurchaseInvoiceItem[];
}
