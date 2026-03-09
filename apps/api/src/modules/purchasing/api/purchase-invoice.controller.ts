import { BadRequestException, Body, Controller, Param, Post } from '@nestjs/common';

import { PURCHASING_PERMISSIONS } from '../../../../../../packages/contracts/src/permissions/purchasing.permissions.ts';
import type { ConfirmPurchaseInvoiceDto } from '../use-cases/confirm-purchase-invoice/dto.ts';
import { ConfirmPurchaseInvoiceUseCase } from '../use-cases/confirm-purchase-invoice/use-case.ts';
import type { CreatePurchaseInvoiceDto } from '../use-cases/create-purchase-invoice/dto.ts';
import { CreatePurchaseInvoiceUseCase } from '../use-cases/create-purchase-invoice/use-case.ts';
import { RequirePermission } from '../../../shared/auth/require-permission.decorator.ts';

@Controller('purchasing/invoices')
export class PurchaseInvoiceController {
  constructor(
    private readonly createPurchaseInvoiceUseCase: CreatePurchaseInvoiceUseCase,
    private readonly confirmPurchaseInvoiceUseCase: ConfirmPurchaseInvoiceUseCase,
  ) {}

  @RequirePermission(PURCHASING_PERMISSIONS.INVOICE_CREATE)
  @Post()
  create(@Body() body: CreatePurchaseInvoiceDto) {
    return this.createPurchaseInvoiceUseCase.execute(body);
  }

  @RequirePermission(PURCHASING_PERMISSIONS.INVOICE_CONFIRM)
  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Body() body: ConfirmPurchaseInvoiceDto) {
    if (body.invoice.id !== id) {
      throw new BadRequestException('Path id must match body.invoice.id.');
    }

    return this.confirmPurchaseInvoiceUseCase.execute(body);
  }
}
