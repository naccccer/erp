import type { SalesInvoice } from '../../entities/sales-invoice.entity';

export interface ConfirmSalesInvoiceDto {
  invoice: SalesInvoice;
}
