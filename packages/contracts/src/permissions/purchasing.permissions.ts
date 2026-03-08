export const PURCHASING_PERMISSIONS = {
  INVOICE_CREATE: 'purchasing.invoice.create',
  INVOICE_READ: 'purchasing.invoice.read',
  INVOICE_CONFIRM: 'purchasing.invoice.confirm',
  INVOICE_CANCEL: 'purchasing.invoice.cancel',
} as const;

export type PurchasingPermissionKey =
  (typeof PURCHASING_PERMISSIONS)[keyof typeof PURCHASING_PERMISSIONS];
