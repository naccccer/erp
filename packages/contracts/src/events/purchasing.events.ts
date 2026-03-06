export const PURCHASING_EVENTS = {
  INVOICE_CONFIRMED: 'purchasing.invoice.confirmed',
} as const;

export const PURCHASING_INVOICE_CONFIRMED_EVENT =
  PURCHASING_EVENTS.INVOICE_CONFIRMED;

export interface PurchasingInvoiceConfirmedEventItemContract {
  product_id: string;
  quantity: number;
  unit_cost: number;
  line_total: number;
}

export interface PurchasingInvoiceConfirmedEventPayloadContract {
  tenant_id: string;
  invoice_id: string;
  supplier_id: string;
  invoice_date: Date;
  total_amount: number;
  items: PurchasingInvoiceConfirmedEventItemContract[];
}

export interface PurchasingInvoiceConfirmedEventContract {
  name: typeof PURCHASING_INVOICE_CONFIRMED_EVENT;
  payload: PurchasingInvoiceConfirmedEventPayloadContract;
}
