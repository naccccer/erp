import { BadRequestException, Controller, Get, Inject, Query, Req } from '@nestjs/common';

import { INVENTORY_PERMISSIONS } from '../../../../../../packages/contracts/src/permissions/inventory.permissions.ts';
import { RequirePermission } from '../../../shared/auth/require-permission.decorator.ts';
import {
  resolveTenantRequestContext,
  type RequestWithTenantContext,
} from '../../../shared/auth/request-context.ts';

import {
  STOCK_MOVEMENT_REPOSITORY,
  type IStockMovementRepository,
} from '../infra/stock-movement.repository.ts';

@Controller('inventory')
export class InventoryMovementsController {
  constructor(
    @Inject(STOCK_MOVEMENT_REPOSITORY)
    private readonly stockMovementRepository: IStockMovementRepository,
  ) {}

  @RequirePermission(INVENTORY_PERMISSIONS.MOVEMENT_READ)
  @Get('movements')
  async list(@Query('invoiceId') invoiceId: string, @Req() request: RequestWithTenantContext) {
    if (!invoiceId) {
      throw new BadRequestException('Query parameter "invoiceId" is required.');
    }

    const tenantContext = resolveTenantRequestContext(request);

    return this.stockMovementRepository.findByReference(tenantContext.tenant_id, invoiceId);
  }
}
