import type { SalesInvoice } from '../entities/sales-invoice.entity';
import {
  SALES_INVOICE_CONFIRMED_EVENT,
  type SalesInvoiceConfirmedEventContract,
  type SalesInvoiceConfirmedEventPayloadContract,
} from '../../../../../../packages/contracts/src/events/sales.events';

export type SalesInvoiceConfirmedEvent = SalesInvoiceConfirmedEventContract;

export function prepareSalesInvoiceConfirmedEvent(
  invoice: SalesInvoice,
): SalesInvoiceConfirmedEvent {
  const payload: SalesInvoiceConfirmedEventPayloadContract = {
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
  };

  return {
    name: SALES_INVOICE_CONFIRMED_EVENT,
    payload,
  };
}
