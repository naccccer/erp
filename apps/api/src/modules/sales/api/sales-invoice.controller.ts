import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import type { ConfirmSalesInvoiceDto } from '../use-cases/confirm-sales-invoice/dto';
import { ConfirmSalesInvoiceUseCase } from '../use-cases/confirm-sales-invoice/use-case';
import type { CreateSalesInvoiceDto } from '../use-cases/create-sales-invoice/dto';
import { CreateSalesInvoiceUseCase } from '../use-cases/create-sales-invoice/use-case';
import {
  SALES_INVOICE_REPOSITORY,
  type ISalesInvoiceRepository,
} from '../infra/sales-invoice.repository';

@Controller('sales/invoices')
export class SalesInvoiceController {
  constructor(
    private readonly createSalesInvoiceUseCase: CreateSalesInvoiceUseCase,
    private readonly confirmSalesInvoiceUseCase: ConfirmSalesInvoiceUseCase,
    @Inject(SALES_INVOICE_REPOSITORY)
    private readonly salesInvoiceRepository: ISalesInvoiceRepository,
  ) {}

  @Post()
  async create(@Body() body: CreateSalesInvoiceDto) {
    return this.createSalesInvoiceUseCase.execute(body);
  }

  @Post(':id/confirm')
  async confirm(@Param('id') id: string, @Body() body: ConfirmSalesInvoiceDto) {
    if (body.invoice.id !== id) {
      throw new BadRequestException('Path id must match body.invoice.id.');
    }

    return this.confirmSalesInvoiceUseCase.execute(body);
  }

  @Get()
  async list(@Query('tenant_id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Query parameter "tenant_id" is required.');
    }

    return this.salesInvoiceRepository.listByTenant(tenantId);
  }
}
