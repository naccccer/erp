import type { SalesInvoiceItem } from './sales-invoice-item.entity';

export type SalesInvoiceStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface SalesInvoice {
  id: string;
  tenant_id: string;
  customer_id: string;
  invoice_date: Date;
  status: SalesInvoiceStatus;
  total_amount: number;
  items: SalesInvoiceItem[];
}
