import { Module } from '@nestjs/common';

import { PurchaseInvoiceController } from './api/purchase-invoice.controller.ts';
import { PrismaPurchaseInvoiceRepository } from './infra/prisma-purchase-invoice.repository.ts';
import { PURCHASE_INVOICE_REPOSITORY } from './infra/purchase-invoice.repository.ts';
import { ConfirmPurchaseInvoiceUseCase } from './use-cases/confirm-purchase-invoice/use-case.ts';
import { CreatePurchaseInvoiceUseCase } from './use-cases/create-purchase-invoice/use-case.ts';

@Module({
  controllers: [PurchaseInvoiceController],
  providers: [
    PrismaPurchaseInvoiceRepository,
    {
      provide: PURCHASE_INVOICE_REPOSITORY,
      useExisting: PrismaPurchaseInvoiceRepository,
    },
    CreatePurchaseInvoiceUseCase,
    ConfirmPurchaseInvoiceUseCase,
  ],
  exports: [CreatePurchaseInvoiceUseCase, ConfirmPurchaseInvoiceUseCase],
})
export class PurchasingModule {}
