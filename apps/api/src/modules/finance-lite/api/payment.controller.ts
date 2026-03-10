import { Body, Controller, Post } from '@nestjs/common';

import { FINANCE_PERMISSIONS } from '../../../../../../packages/contracts/src/permissions/finance.permissions.ts';
import { RequirePermission } from '../../../shared/auth/require-permission.decorator.ts';
import type { RegisterPaymentDto } from '../use-cases/register-payment/dto.ts';
import { RegisterPaymentUseCase } from '../use-cases/register-payment/use-case.ts';

@Controller('finance/payments')
export class PaymentController {
  constructor(private readonly registerPaymentUseCase: RegisterPaymentUseCase) {}

  @RequirePermission(FINANCE_PERMISSIONS.PAYMENT_CREATE)
  @Post()
  async create(@Body() body: RegisterPaymentDto) {
    return this.registerPaymentUseCase.execute(body);
  }
}
