import { Module } from '@nestjs/common';

import { PurchasingInvoiceConfirmedInventoryEventHandler } from './contract/purchasing-invoice-confirmed.handler.ts';
import { SalesInvoiceConfirmedInventoryEventHandler } from './contract/sales-invoice-confirmed.handler.ts';
import { CreatePurchaseInvoiceStockInMovementsUseCase } from './use-cases/create-purchase-invoice-stock-in-movements/use-case.ts';
import { CreateSalesInvoiceStockOutMovementsUseCase } from './use-cases/create-sales-invoice-stock-out-movements/use-case.ts';

@Module({
  providers: [
    CreateSalesInvoiceStockOutMovementsUseCase,
    CreatePurchaseInvoiceStockInMovementsUseCase,
    SalesInvoiceConfirmedInventoryEventHandler,
    PurchasingInvoiceConfirmedInventoryEventHandler,
  ],
  exports: [
    CreateSalesInvoiceStockOutMovementsUseCase,
    CreatePurchaseInvoiceStockInMovementsUseCase,
    SalesInvoiceConfirmedInventoryEventHandler,
    PurchasingInvoiceConfirmedInventoryEventHandler,
  ],
})
export class InventoryModule {}
