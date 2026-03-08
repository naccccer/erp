import { Module } from '@nestjs/common';

import { RegisterPaymentUseCase } from './use-cases/register-payment/use-case.ts';

@Module({
  providers: [RegisterPaymentUseCase],
  exports: [RegisterPaymentUseCase],
})
export class FinanceLiteModule {}
