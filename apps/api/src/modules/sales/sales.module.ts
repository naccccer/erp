import { Module } from '@nestjs/common';

import { ConfirmSalesInvoiceUseCase } from './use-cases/confirm-sales-invoice/use-case';
import { CreateSalesInvoiceUseCase } from './use-cases/create-sales-invoice/use-case';

@Module({
  providers: [CreateSalesInvoiceUseCase, ConfirmSalesInvoiceUseCase],
  exports: [CreateSalesInvoiceUseCase, ConfirmSalesInvoiceUseCase],
})
export class SalesModule {}
