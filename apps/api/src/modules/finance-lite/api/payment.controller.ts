import { Body, Controller, Post } from '@nestjs/common';

import type { RegisterPaymentDto } from '../use-cases/register-payment/dto.ts';
import { RegisterPaymentUseCase } from '../use-cases/register-payment/use-case.ts';

@Controller('finance/payments')
export class PaymentController {
  constructor(private readonly registerPaymentUseCase: RegisterPaymentUseCase) {}

  @Post()
  create(@Body() body: RegisterPaymentDto) {
    return this.registerPaymentUseCase.execute(body);
  }
}
