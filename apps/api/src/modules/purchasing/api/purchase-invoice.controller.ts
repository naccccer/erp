import { BadRequestException, Body, Controller, Param, Post } from '@nestjs/common';

import type { ConfirmPurchaseInvoiceDto } from '../use-cases/confirm-purchase-invoice/dto.ts';
import { ConfirmPurchaseInvoiceUseCase } from '../use-cases/confirm-purchase-invoice/use-case.ts';
import type { CreatePurchaseInvoiceDto } from '../use-cases/create-purchase-invoice/dto.ts';
import { CreatePurchaseInvoiceUseCase } from '../use-cases/create-purchase-invoice/use-case.ts';

@Controller('purchasing/invoices')
export class PurchaseInvoiceController {
  constructor(
    private readonly createPurchaseInvoiceUseCase: CreatePurchaseInvoiceUseCase,
    private readonly confirmPurchaseInvoiceUseCase: ConfirmPurchaseInvoiceUseCase,
  ) {}

  @Post()
  create(@Body() body: CreatePurchaseInvoiceDto) {
    return this.createPurchaseInvoiceUseCase.execute(body);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Body() body: ConfirmPurchaseInvoiceDto) {
    if (body.invoice.id !== id) {
      throw new BadRequestException('Path id must match body.invoice.id.');
    }

    return this.confirmPurchaseInvoiceUseCase.execute(body);
  }
}
