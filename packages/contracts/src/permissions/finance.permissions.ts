export const FINANCE_PERMISSIONS = {
  PAYMENT_CREATE: 'finance.payment.create',
} as const;

export type FinancePermissionKey =
  (typeof FINANCE_PERMISSIONS)[keyof typeof FINANCE_PERMISSIONS];
