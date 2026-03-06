import {
  PURCHASING_INVOICE_CONFIRMED_EVENT,
  type PurchasingInvoiceConfirmedEventContract,
} from '../../../../../../packages/contracts/src/events/purchasing.events.ts';
import type { PurchaseInvoice } from '../entities/purchase-invoice.entity.ts';

export type PurchasingInvoiceConfirmedEvent = PurchasingInvoiceConfirmedEventContract;

export function preparePurchasingInvoiceConfirmedEvent(
  invoice: PurchaseInvoice,
): PurchasingInvoiceConfirmedEvent {
  return {
    name: PURCHASING_INVOICE_CONFIRMED_EVENT,
    payload: {
      tenant_id: invoice.tenant_id,
      invoice_id: invoice.id,
      supplier_id: invoice.supplier_id,
      invoice_date: invoice.invoice_date,
      total_amount: invoice.total_amount,
      items: invoice.items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        line_total: item.line_total,
      })),
    },
  };
}
