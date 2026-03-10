import { Module } from '@nestjs/common';

import { PaymentController } from './api/payment.controller.ts';
import { PrismaPaymentRepository } from './infra/prisma-payment.repository.ts';
import { PAYMENT_REPOSITORY } from './infra/payment.repository.ts';
import { RegisterPaymentUseCase } from './use-cases/register-payment/use-case.ts';

@Module({
  controllers: [PaymentController],
  providers: [
    PrismaPaymentRepository,
    {
      provide: PAYMENT_REPOSITORY,
      useExisting: PrismaPaymentRepository,
    },
    RegisterPaymentUseCase,
  ],
  exports: [RegisterPaymentUseCase],
})
export class FinanceLiteModule {}
