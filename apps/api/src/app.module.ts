import { Module } from '@nestjs/common';

import { AuthModule } from './modules/auth/auth.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { FinanceLiteModule } from './modules/finance-lite/finance-lite.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ProductsModule } from './modules/products/products.module';
import { PurchasingModule } from './modules/purchasing/purchasing.module';
import { SalesModule } from './modules/sales/sales.module';

@Module({
  imports: [
    AuthModule,
    ContactsModule,
    FinanceLiteModule,
    InventoryModule,
    ProductsModule,
    PurchasingModule,
    SalesModule,
  ],
})
export class AppModule {}
