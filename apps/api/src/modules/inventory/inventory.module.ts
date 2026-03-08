import { Module } from '@nestjs/common';

import { PurchasingInvoiceConfirmedInventoryEventHandler } from './contract/purchasing-invoice-confirmed.handler.ts';
import { SalesInvoiceConfirmedInventoryEventHandler } from './contract/sales-invoice-confirmed.handler.ts';
import { PrismaStockMovementRepository } from './infra/prisma-stock-movement.repository.ts';
import { PrismaWarehouseRepository } from './infra/prisma-warehouse.repository.ts';
import { STOCK_MOVEMENT_REPOSITORY } from './infra/stock-movement.repository.ts';
import { WAREHOUSE_REPOSITORY } from './infra/warehouse.repository.ts';
import { CreatePurchaseInvoiceStockInMovementsUseCase } from './use-cases/create-purchase-invoice-stock-in-movements/use-case.ts';
import { CreateSalesInvoiceStockOutMovementsUseCase } from './use-cases/create-sales-invoice-stock-out-movements/use-case.ts';

@Module({
  providers: [
    PrismaStockMovementRepository,
    PrismaWarehouseRepository,
    {
      provide: STOCK_MOVEMENT_REPOSITORY,
      useExisting: PrismaStockMovementRepository,
    },
    {
      provide: WAREHOUSE_REPOSITORY,
      useExisting: PrismaWarehouseRepository,
    },
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
