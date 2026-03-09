import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
} from '@nestjs/common';

import { SALES_PERMISSIONS } from '../../../../../../packages/contracts/src/permissions/sales.permissions.ts';
import type { ConfirmSalesInvoiceDto } from '../use-cases/confirm-sales-invoice/dto';
import { ConfirmSalesInvoiceUseCase } from '../use-cases/confirm-sales-invoice/use-case';
import type { CreateSalesInvoiceDto } from '../use-cases/create-sales-invoice/dto';
import { CreateSalesInvoiceUseCase } from '../use-cases/create-sales-invoice/use-case';
import {
  SALES_INVOICE_REPOSITORY,
  type ISalesInvoiceRepository,
} from '../infra/sales-invoice.repository';
import { RequirePermission } from '../../../shared/auth/require-permission.decorator.ts';
import {
  resolveTenantRequestContext,
  type RequestWithTenantContext,
} from '../../../shared/auth/request-context.ts';

@Controller('sales/invoices')
export class SalesInvoiceController {
  constructor(
    private readonly createSalesInvoiceUseCase: CreateSalesInvoiceUseCase,
    private readonly confirmSalesInvoiceUseCase: ConfirmSalesInvoiceUseCase,
    @Inject(SALES_INVOICE_REPOSITORY)
    private readonly salesInvoiceRepository: ISalesInvoiceRepository,
  ) {}

  @RequirePermission(SALES_PERMISSIONS.INVOICE_CREATE)
  @Post()
  async create(@Body() body: CreateSalesInvoiceDto) {
    return this.createSalesInvoiceUseCase.execute(body);
  }

  @RequirePermission(SALES_PERMISSIONS.INVOICE_CONFIRM)
  @Post(':id/confirm')
  async confirm(@Param('id') id: string, @Body() body: ConfirmSalesInvoiceDto) {
    if (body.invoice.id !== id) {
      throw new BadRequestException('Path id must match body.invoice.id.');
    }

    return this.confirmSalesInvoiceUseCase.execute(body);
  }

  @RequirePermission(SALES_PERMISSIONS.INVOICE_READ)
  @Get()
  async list(@Req() request: RequestWithTenantContext) {
    const tenantContext = resolveTenantRequestContext(request);

    return this.salesInvoiceRepository.listByTenant(tenantContext.tenant_id);
  }
}
