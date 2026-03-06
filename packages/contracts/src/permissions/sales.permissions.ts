export const SALES_PERMISSIONS = {
  INVOICE_CREATE: 'sales.invoice.create',
  INVOICE_READ: 'sales.invoice.read',
  INVOICE_CONFIRM: 'sales.invoice.confirm',
  INVOICE_CANCEL: 'sales.invoice.cancel',
} as const;

export type SalesPermissionKey =
  (typeof SALES_PERMISSIONS)[keyof typeof SALES_PERMISSIONS];
