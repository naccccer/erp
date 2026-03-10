import type { Payment } from '../entities/payment.entity.ts';

export const PAYMENT_REPOSITORY = Symbol('IPaymentRepository');

export interface IPaymentRepository {
  create(payment: Payment): Promise<Payment>;
}
