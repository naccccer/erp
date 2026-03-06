export const SALES_EVENTS = {
  INVOICE_CONFIRMED: 'sales.invoice.confirmed',
  INVOICE_CANCELLED: 'sales.invoice.cancelled',
} as const;

export const SALES_INVOICE_CONFIRMED_EVENT = SALES_EVENTS.INVOICE_CONFIRMED;
export const SALES_INVOICE_CANCELLED_EVENT = SALES_EVENTS.INVOICE_CANCELLED;

export type SalesEventName = (typeof SALES_EVENTS)[keyof typeof SALES_EVENTS];
