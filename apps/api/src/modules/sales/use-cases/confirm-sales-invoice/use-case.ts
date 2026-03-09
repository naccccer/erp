import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import {
  prepareSalesInvoiceConfirmedEvent,
  type SalesInvoiceConfirmedEvent,
} from '../../contract/sales.events';
import type { SalesInvoice } from '../../entities/sales-invoice.entity';
import {
  SALES_INVOICE_REPOSITORY,
  type ISalesInvoiceRepository,
} from '../../infra/sales-invoice.repository';
import { publishDomainEvents } from '../../../../shared/events/domain-event.publisher';
import type { ConfirmSalesInvoiceDto } from './dto';

export interface ConfirmSalesInvoiceResult {
  invoice: SalesInvoice;
  events: SalesInvoiceConfirmedEvent[];
}

@Injectable()
export class ConfirmSalesInvoiceUseCase {
  constructor(
    @Inject(SALES_INVOICE_REPOSITORY)
    private readonly salesInvoiceRepository: ISalesInvoiceRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(input: ConfirmSalesInvoiceDto): Promise<ConfirmSalesInvoiceResult> {
    if (input.invoice.status !== 'Draft') {
      throw new Error('Only draft sales invoices can be confirmed.');
    }

    const confirmedInvoice: SalesInvoice = {
      ...input.invoice,
      status: 'Confirmed',
    };
    const persistedInvoice = await this.salesInvoiceRepository.update(confirmedInvoice);
    const event = prepareSalesInvoiceConfirmedEvent(persistedInvoice);

    await publishDomainEvents(this.eventEmitter, [event]);

    return {
      invoice: persistedInvoice,
      events: [event],
    };
  }
}
