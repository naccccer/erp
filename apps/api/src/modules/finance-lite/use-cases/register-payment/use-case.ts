import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import type { Payment } from '../../entities/payment.entity.ts';
import type { RegisterPaymentDto } from './dto.ts';

@Injectable()
export class RegisterPaymentUseCase {
  execute(input: RegisterPaymentDto): Payment {
    return {
      id: randomUUID(),
      tenant_id: input.tenant_id,
      reference_type: input.reference_type,
      reference_id: input.reference_id,
      amount: input.amount,
      paid_at: input.paid_at,
      status: 'Registered',
    };
  }
}
