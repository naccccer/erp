import { BadRequestException, Controller, Get, Inject, Query } from '@nestjs/common';

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

  @Get('movements')
  async list(@Query('invoiceId') invoiceId: string) {
    if (!invoiceId) {
      throw new BadRequestException('Query parameter "invoiceId" is required.');
    }

    return this.stockMovementRepository.findByReference(invoiceId);
  }
}
