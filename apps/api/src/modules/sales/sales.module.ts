import { Module } from '@nestjs/common';

import { SalesInvoiceController } from './api/sales-invoice.controller';
import { PrismaSalesInvoiceRepository } from './infra/prisma-sales-invoice.repository';
import { SALES_INVOICE_REPOSITORY } from './infra/sales-invoice.repository';
import { ConfirmSalesInvoiceUseCase } from './use-cases/confirm-sales-invoice/use-case';
import { CreateSalesInvoiceUseCase } from './use-cases/create-sales-invoice/use-case';

@Module({
  controllers: [SalesInvoiceController],
  providers: [
    PrismaSalesInvoiceRepository,
    {
      provide: SALES_INVOICE_REPOSITORY,
      useExisting: PrismaSalesInvoiceRepository,
    },
    CreateSalesInvoiceUseCase,
    ConfirmSalesInvoiceUseCase,
  ],
  exports: [CreateSalesInvoiceUseCase, ConfirmSalesInvoiceUseCase],
})
export class SalesModule {}
