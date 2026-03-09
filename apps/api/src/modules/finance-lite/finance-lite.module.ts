import { Module } from '@nestjs/common';

import { PaymentController } from './api/payment.controller.ts';
import { RegisterPaymentUseCase } from './use-cases/register-payment/use-case.ts';

@Module({
  controllers: [PaymentController],
  providers: [RegisterPaymentUseCase],
  exports: [RegisterPaymentUseCase],
})
export class FinanceLiteModule {}
