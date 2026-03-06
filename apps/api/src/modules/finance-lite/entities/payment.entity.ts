export type PaymentStatus = 'Registered' | 'Cancelled';

export interface Payment {
  id: string;
  tenant_id: string;
  reference_type: string;
  reference_id: string;
  amount: number;
  paid_at: Date;
  status: PaymentStatus;
}
