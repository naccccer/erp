import { Module } from '@nestjs/common';

import { PurchaseInvoiceController } from './api/purchase-invoice.controller.ts';
import { ConfirmPurchaseInvoiceUseCase } from './use-cases/confirm-purchase-invoice/use-case.ts';
import { CreatePurchaseInvoiceUseCase } from './use-cases/create-purchase-invoice/use-case.ts';

@Module({
  controllers: [PurchaseInvoiceController],
  providers: [CreatePurchaseInvoiceUseCase, ConfirmPurchaseInvoiceUseCase],
  exports: [CreatePurchaseInvoiceUseCase, ConfirmPurchaseInvoiceUseCase],
})
export class PurchasingModule {}
