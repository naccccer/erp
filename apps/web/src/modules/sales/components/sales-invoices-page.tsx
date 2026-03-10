import { revalidatePath } from 'next/cache';

import {
  confirmSalesInvoice,
  createSalesInvoice,
  listInventoryMovements,
  listSalesInvoices,
  type SalesInvoiceDto,
  type StockMovementDto,
} from '../server/sales-api';

const DEFAULT_TENANT_ID = 'default';

function readText(formData: FormData, key: string, fallback: string): string {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function readNumber(formData: FormData, key: string, fallback: number): number {
  const parsed = Number(readText(formData, key, String(fallback)));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

function parseInvoiceDateToIso(value: string): string {
  const isoDate = `${value}T00:00:00.000Z`;
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

type SalesInvoiceView = {
  invoice: SalesInvoiceDto;
  stock_movements: StockMovementDto[];
};

async function loadInvoiceViews(tenantId: string): Promise<SalesInvoiceView[]> {
  const invoices = await listSalesInvoices(tenantId);
  const confirmedInvoices = invoices.filter((invoice) => invoice.status === 'Confirmed');
  const movementEntries = await Promise.all(
    confirmedInvoices.map(
      async (invoice) => [invoice.id, await listInventoryMovements(invoice.id, tenantId)] as const,
    ),
  );
  const movementsByInvoiceId = new Map<string, StockMovementDto[]>(movementEntries);

  return invoices.map((invoice) => ({
    invoice,
    stock_movements: movementsByInvoiceId.get(invoice.id) ?? [],
  }));
}

async function createSalesInvoiceAction(formData: FormData): Promise<void> {
  'use server';

  try {
    await createSalesInvoice({
      tenant_id: readText(formData, 'tenant_id', DEFAULT_TENANT_ID),
      customer_id: readText(formData, 'customer_id', 'customer-1'),
      invoice_date: parseInvoiceDateToIso(
        readText(formData, 'invoice_date', new Date().toISOString().slice(0, 10)),
      ),
      items: [
        {
          product_id: readText(formData, 'product_id', 'product-1'),
          quantity: Math.max(1, readNumber(formData, 'quantity', 1)),
          unit_price: Math.max(0, readNumber(formData, 'unit_price', 0)),
          discount: Math.max(0, readNumber(formData, 'discount', 0)),
        },
      ],
    });
  } finally {
    revalidatePath('/sales');
  }
}

async function confirmSalesInvoiceAction(formData: FormData): Promise<void> {
  'use server';

  const invoiceJson = readText(formData, 'invoice_json', '');
  if (!invoiceJson) {
    return;
  }

  try {
    const invoice = JSON.parse(invoiceJson) as SalesInvoiceDto;
    await confirmSalesInvoice(invoice);
  } catch {
    return;
  } finally {
    revalidatePath('/sales');
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(value));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}

function statusLabel(status: string): string {
  if (status === 'Draft') {
    return 'پیش نویس';
  }

  if (status === 'Confirmed') {
    return 'تایید شده';
  }

  return 'لغو شده';
}

export async function SalesInvoicesPage() {
  let invoiceViews: SalesInvoiceView[] = [];
  let hasDataError = false;

  try {
    invoiceViews = await loadInvoiceViews(DEFAULT_TENANT_ID);
  } catch {
    hasDataError = true;
  }

  const confirmedInvoiceViews = invoiceViews.filter(
    (invoiceView) => invoiceView.invoice.status === 'Confirmed',
  );
  const checkpointLoadResult = hasDataError
    ? 'خطا در بارگذاری داده های فروش و انبار از API'
    : `بارگذاری موفق (${formatNumber(invoiceViews.length)} فاکتور فروش)`;

  return (
    <section className="sales-page" aria-labelledby="sales-page-title">
      <header className="sales-page__header">
        <h1 id="sales-page-title" className="sales-page__title">
          فاکتورهای فروش
        </h1>
        <p className="sales-page__subtitle">
          ایجاد پیش نویس، تایید فاکتور و مشاهده خروجی حرکت انبار
        </p>
      </header>

      <section className="visibility-checkpoint" aria-labelledby="sales-checkpoint-title">
        <h2 id="sales-checkpoint-title" className="visibility-checkpoint__title">
          checkpoint مشاهده پذیری
        </h2>
        <p className="visibility-checkpoint__line">
          داده های نمایش داده شده: لیست فاکتورهای فروش + وضعیت تایید + حرکات انبار فاکتورهای تاییدشده
        </p>
        <p className="visibility-checkpoint__line">آخرین نتیجه بارگذاری: {checkpointLoadResult}</p>
      </section>

      {hasDataError ? (
        <section className="sales-card" aria-live="polite">
          <p className="sales-empty">اتصال به API برقرار نشد. لطفا سرویس API را اجرا کنید.</p>
        </section>
      ) : null}

      <section className="sales-card" aria-labelledby="sales-create-title">
        <h2 id="sales-create-title" className="sales-card__title">
          ایجاد پیش نویس فاکتور
        </h2>

        <form action={createSalesInvoiceAction} className="sales-form">
          <label className="sales-field">
            <span>شناسه مستاجر</span>
            <input name="tenant_id" defaultValue={DEFAULT_TENANT_ID} required />
          </label>

          <label className="sales-field">
            <span>شناسه مشتری</span>
            <input name="customer_id" placeholder="customer-1" required />
          </label>

          <label className="sales-field">
            <span>تاریخ فاکتور</span>
            <input name="invoice_date" type="date" required />
          </label>

          <label className="sales-field">
            <span>شناسه کالا</span>
            <input name="product_id" placeholder="product-1" required />
          </label>

          <label className="sales-field">
            <span>تعداد</span>
            <input name="quantity" type="number" min={1} step={1} defaultValue={1} required />
          </label>

          <label className="sales-field">
            <span>قیمت واحد</span>
            <input
              name="unit_price"
              type="number"
              min={0}
              step={1}
              defaultValue={0}
              required
            />
          </label>

          <label className="sales-field">
            <span>تخفیف</span>
            <input name="discount" type="number" min={0} step={1} defaultValue={0} />
          </label>

          <button type="submit" className="sales-button">
            ایجاد پیش نویس
          </button>
        </form>
      </section>

      <section className="sales-card" aria-labelledby="sales-list-title">
        <h2 id="sales-list-title" className="sales-card__title">
          لیست فاکتورها
        </h2>

        {invoiceViews.length === 0 ? (
          <p className="sales-empty">هنوز فاکتوری ثبت نشده است.</p>
        ) : (
          <div className="sales-table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>شناسه</th>
                  <th>مشتری</th>
                  <th>تاریخ</th>
                  <th>مبلغ کل</th>
                  <th>وضعیت</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {invoiceViews.map((invoiceView) => (
                  <tr key={invoiceView.invoice.id}>
                    <td dir="ltr">{invoiceView.invoice.id}</td>
                    <td dir="ltr">{invoiceView.invoice.customer_id}</td>
                    <td>{formatDate(invoiceView.invoice.invoice_date)}</td>
                    <td>{formatNumber(invoiceView.invoice.total_amount)}</td>
                    <td>{statusLabel(invoiceView.invoice.status)}</td>
                    <td>
                      <form action={confirmSalesInvoiceAction}>
                        <input
                          type="hidden"
                          name="invoice_json"
                          value={JSON.stringify(invoiceView.invoice)}
                        />
                        <button
                          type="submit"
                          className="sales-button sales-button--secondary"
                          disabled={invoiceView.invoice.status !== 'Draft'}
                        >
                          تایید
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="sales-card" aria-labelledby="sales-movement-title">
        <h2 id="sales-movement-title" className="sales-card__title">
          نتیجه حرکت انبار
        </h2>

        {confirmedInvoiceViews.length === 0 ? (
          <p className="sales-empty">
            بعد از تایید فاکتور، حرکت خروجی انبار در این بخش نمایش داده می شود.
          </p>
        ) : (
          <div className="sales-movement-list">
            {confirmedInvoiceViews.map((invoiceView) => (
              <article key={invoiceView.invoice.id} className="sales-movement-item">
                <h3 className="sales-movement-item__title">
                  فاکتور <span dir="ltr">{invoiceView.invoice.id}</span>
                </h3>

                {invoiceView.stock_movements.length === 0 ? (
                  <p className="sales-empty">برای این فاکتور حرکتی ثبت نشده است.</p>
                ) : (
                  <ul className="sales-movement-item__rows">
                    {invoiceView.stock_movements.map((movement) => (
                      <li key={movement.id}>
                        نوع: {movement.movement_type} | کالا:{' '}
                        <span dir="ltr">{movement.product_id}</span> | تعداد:{' '}
                        {formatNumber(movement.quantity)} | انبار:{' '}
                        <span dir="ltr">{movement.warehouse_id}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
