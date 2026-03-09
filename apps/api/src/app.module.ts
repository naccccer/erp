import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './modules/auth/auth.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { FinanceLiteModule } from './modules/finance-lite/finance-lite.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductsModule } from './modules/products/products.module';
import { PurchasingModule } from './modules/purchasing/purchasing.module';
import { SalesModule } from './modules/sales/sales.module';
import { TenantPermissionGuard } from './shared/auth/tenant-permission.guard.ts';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    AuthModule,
    ContactsModule,
    FinanceLiteModule,
    InventoryModule,
    ProductsModule,
    PurchasingModule,
    SalesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: TenantPermissionGuard,
    },
  ],
})
export class AppModule {}
