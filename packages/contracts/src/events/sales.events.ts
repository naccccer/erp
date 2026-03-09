import type { DomainEvent } from './domain-event.ts';

export const SALES_EVENTS = {
  INVOICE_CONFIRMED: 'sales.invoice.confirmed',
  INVOICE_CANCELLED: 'sales.invoice.cancelled',
} as const;

export const SALES_INVOICE_CONFIRMED_EVENT = SALES_EVENTS.INVOICE_CONFIRMED;
export const SALES_INVOICE_CANCELLED_EVENT = SALES_EVENTS.INVOICE_CANCELLED;

export type SalesEventName = (typeof SALES_EVENTS)[keyof typeof SALES_EVENTS];

export interface SalesInvoiceConfirmedEventItemContract {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  line_total: number;
}

export interface SalesInvoiceConfirmedEventPayloadContract {
  tenant_id: string;
  invoice_id: string;
  customer_id: string;
  invoice_date: Date;
  total_amount: number;
  items: SalesInvoiceConfirmedEventItemContract[];
}

export interface SalesInvoiceConfirmedEventContract
  extends DomainEvent<
    typeof SALES_INVOICE_CONFIRMED_EVENT,
    SalesInvoiceConfirmedEventPayloadContract
  > {}
