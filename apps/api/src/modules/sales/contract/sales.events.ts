import type { SalesInvoice } from '../entities/sales-invoice.entity';
import { SALES_INVOICE_CONFIRMED_EVENT } from '../../../../../../packages/contracts/src/events/sales.events';

export interface SalesInvoiceConfirmedEventItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

export interface SalesInvoiceConfirmedEventPayload {
  tenant_id: string;
  invoice_id: string;
  customer_id: string;
  invoice_date: Date;
  total_amount: number;
  items: SalesInvoiceConfirmedEventItem[];
}

export interface SalesInvoiceConfirmedEvent {
  name: typeof SALES_INVOICE_CONFIRMED_EVENT;
  payload: SalesInvoiceConfirmedEventPayload;
}

export function prepareSalesInvoiceConfirmedEvent(
  invoice: SalesInvoice,
): SalesInvoiceConfirmedEvent {
  return {
    name: SALES_INVOICE_CONFIRMED_EVENT,
    payload: {
      tenant_id: invoice.tenant_id,
      invoice_id: invoice.id,
      customer_id: invoice.customer_id,
      invoice_date: invoice.invoice_date,
      total_amount: invoice.total_amount,
      items: invoice.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        line_total: item.line_total,
      })),
    },
  };
}
