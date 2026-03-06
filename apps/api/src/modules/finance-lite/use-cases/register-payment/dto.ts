export interface RegisterPaymentDto {
  tenant_id: string;
  reference_type: string;
  reference_id: string;
  amount: number;
  paid_at: Date;
}
