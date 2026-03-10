import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import type { Payment } from '../../entities/payment.entity.ts';
import {
  PAYMENT_REPOSITORY,
  type IPaymentRepository,
} from '../../infra/payment.repository.ts';
import type { RegisterPaymentDto } from './dto.ts';

@Injectable()
export class RegisterPaymentUseCase {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(input: RegisterPaymentDto): Promise<Payment> {
    const payment: Payment = {
      id: randomUUID(),
      tenant_id: input.tenant_id,
      reference_type: input.reference_type,
      reference_id: input.reference_id,
      amount: input.amount,
      paid_at: input.paid_at,
      status: 'Registered',
    };

    return this.paymentRepository.create(payment);
  }
}
