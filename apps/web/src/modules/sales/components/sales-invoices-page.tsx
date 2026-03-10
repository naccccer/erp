import { revalidatePath } from 'next/cache';

import {
  confirmSalesInvoice,
  createSalesInvoice,
  listInventoryMovements,
  listSalesInvoices,
  type SalesInvoiceDto,
  type StockMovementDto,
} from '../server/sales-api';
import {
  applySalesOpsList,
  buildSalesOpsHref,
  readSalesOpsQuery,
  SALES_PAGE_SIZE_OPTIONS,
  type SalesOpsQueryState,
  type SalesOpsSearchParams,
} from '../server/sales-ops-query';
import { JalaliDateField } from '../../shared/components/jalali-date-field';
import {
  VisibilityCheckpoint,
  type VisibilityCheckpointStatus,
} from '../../shared/components/visibility-checkpoint';
import { formatIsoToJalaliLabel } from '../../shared/date/jalali-date';

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
  const trimmed = value.trim();
  if (!trimmed) {
    return new Date().toISOString();
  }

  const directDate = new Date(trimmed);
  if (!Number.isNaN(directDate.getTime())) {
    return directDate.toISOString();
  }

  const dateOnly = new Date(`${trimmed}T00:00:00.000Z`);
  return Number.isNaN(dateOnly.getTime()) ? new Date().toISOString() : dateOnly.toISOString();
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
  return formatIsoToJalaliLabel(value);
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

function sortByLabel(value: SalesOpsQueryState['sortBy']): string {
  if (value === 'total_amount') {
    return 'مبلغ کل';
  }

  if (value === 'customer_id') {
    return 'مشتری';
  }

  if (value === 'status') {
    return 'وضعیت';
  }

  return 'تاریخ فاکتور';
}

function resolveSelectedInvoice(
  filteredInvoices: SalesInvoiceDto[],
  pagedInvoices: SalesInvoiceDto[],
  selectedInvoiceId: string,
): SalesInvoiceDto | null {
  if (selectedInvoiceId) {
    const selected = filteredInvoices.find((invoice) => invoice.id === selectedInvoiceId);
    if (selected) {
      return selected;
    }
  }

  return pagedInvoices[0] ?? null;
}

async function loadSalesOperations(
  query: SalesOpsQueryState,
): Promise<{
  hasListError: boolean;
  invoices: SalesInvoiceDto[];
  stockMovements: StockMovementDto[];
  selectedInvoice: SalesInvoiceDto | null;
  hasDetailError: boolean;
}> {
  let invoices: SalesInvoiceDto[] = [];
  let hasListError = false;

  try {
    invoices = await listSalesInvoices(query.tenantId);
  } catch {
    hasListError = true;
  }

  const listed = applySalesOpsList(invoices, query);
  const selectedInvoice = resolveSelectedInvoice(
    listed.filteredInvoices,
    listed.pagedInvoices,
    query.selectedInvoiceId,
  );

  if (hasListError || !selectedInvoice || selectedInvoice.status !== 'Confirmed') {
    return {
      hasListError,
      invoices,
      stockMovements: [],
      selectedInvoice,
      hasDetailError: false,
    };
  }

  try {
    const stockMovements = await listInventoryMovements(selectedInvoice.id, selectedInvoice.tenant_id);

    return {
      hasListError,
      invoices,
      stockMovements,
      selectedInvoice,
      hasDetailError: false,
    };
  } catch {
    return {
      hasListError,
      invoices,
      stockMovements: [],
      selectedInvoice,
      hasDetailError: true,
    };
  }
}

type SalesInvoicesPageProps = {
  searchParams?: SalesOpsSearchParams;
};

export async function SalesInvoicesPage({ searchParams }: SalesInvoicesPageProps) {
  const query = readSalesOpsQuery(searchParams, DEFAULT_TENANT_ID);
  const {
    hasListError,
    invoices,
    stockMovements,
    selectedInvoice,
    hasDetailError,
  } = await loadSalesOperations(query);
  const listResult = applySalesOpsList(invoices, query);
  const activeQuery: SalesOpsQueryState = {
    ...query,
    page: listResult.currentPage,
    selectedInvoiceId: selectedInvoice?.id ?? '',
  };

  const showLoadingHint = !hasListError && invoices.length === 0;
  const checkpointStatus: VisibilityCheckpointStatus = hasListError ? 'error' : 'success';
  const checkpointLoadResult = hasListError
    ? 'خطا در بارگذاری داده های عملیات فروش از API'
    : `بارگذاری موفق (${formatNumber(listResult.totalCount)} فاکتور با فیلتر جاری)`;
  const startRow =
    listResult.totalCount === 0 ? 0 : (listResult.currentPage - 1) * query.pageSize + 1;
  const endRow = Math.min(startRow + listResult.pagedInvoices.length - 1, listResult.totalCount);

  return (
    <section className="sales-page" aria-labelledby="sales-page-title">
      <header className="sales-page__header">
        <h1 id="sales-page-title" className="sales-page__title">
          کنسول عملیات فروش
        </h1>
        <p className="sales-page__subtitle">
          فیلتر، مرتب سازی، صفحه بندی و بررسی جزئیات فاکتور در یک نمای عملیاتی
        </p>
      </header>

      <VisibilityCheckpoint
        titleId="sales-checkpoint-title"
        status={checkpointStatus}
        dataSummary="داده های نمایش داده شده: لیست فاکتورهای فروش (با فیلتر/مرتب سازی/صفحه بندی) + جزئیات فاکتور انتخابی + حرکت های انبار مرتبط"
        tenantId={query.tenantId}
        lastResult={checkpointLoadResult}
      />

      <section className="sales-card" aria-labelledby="sales-create-title">
        <h2 id="sales-create-title" className="sales-card__title">
          ایجاد پیش نویس فاکتور
        </h2>

        <form action={createSalesInvoiceAction} className="sales-form">
          <label className="sales-field">
            <span>شناسه مستاجر</span>
            <input name="tenant_id" defaultValue={query.tenantId} required />
          </label>

          <label className="sales-field">
            <span>شناسه مشتری</span>
            <input name="customer_id" placeholder="customer-1" required />
          </label>

          <label className="sales-field">
            <span>تاریخ فاکتور</span>
            <JalaliDateField name="invoice_date" required />
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

      <section className="sales-card" aria-labelledby="sales-ops-title">
        <h2 id="sales-ops-title" className="sales-card__title">
          عملیات لیست فروش
        </h2>

        <form action="/sales" method="get" className="sales-form sales-form--ops">
          <input type="hidden" name="page" value="1" />
          <label className="sales-field">
            <span>شناسه مستاجر</span>
            <input name="tenant_id" defaultValue={query.tenantId} required />
          </label>
          <label className="sales-field">
            <span>فیلتر شناسه فاکتور</span>
            <input name="invoice_id" defaultValue={query.invoiceIdFilter} />
          </label>
          <label className="sales-field">
            <span>فیلتر مشتری</span>
            <input name="customer_id" defaultValue={query.customerIdFilter} />
          </label>
          <label className="sales-field">
            <span>وضعیت</span>
            <select name="status" defaultValue={query.statusFilter}>
              <option value="all">همه</option>
              <option value="Draft">پیش نویس</option>
              <option value="Confirmed">تایید شده</option>
              <option value="Cancelled">لغو شده</option>
            </select>
          </label>
          <label className="sales-field">
            <span>مرتب سازی بر اساس</span>
            <select name="sort_by" defaultValue={query.sortBy}>
              <option value="invoice_date">تاریخ فاکتور</option>
              <option value="total_amount">مبلغ کل</option>
              <option value="customer_id">مشتری</option>
              <option value="status">وضعیت</option>
            </select>
          </label>
          <label className="sales-field">
            <span>جهت مرتب سازی</span>
            <select name="sort_direction" defaultValue={query.sortDirection}>
              <option value="desc">نزولی</option>
              <option value="asc">صعودی</option>
            </select>
          </label>
          <label className="sales-field">
            <span>اندازه صفحه</span>
            <select name="page_size" defaultValue={String(query.pageSize)}>
              {SALES_PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {formatNumber(size)} ردیف
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="sales-button">
            اعمال فیلترها
          </button>
          <a
            className="sales-link-button"
            href={`/sales?tenant_id=${encodeURIComponent(query.tenantId)}`}
          >
            پاک کردن فیلترها
          </a>
        </form>

        {hasListError ? (
          <p className="sales-empty">خطا: دریافت لیست فروش انجام نشد. اتصال API را بررسی کنید.</p>
        ) : listResult.totalCount === 0 ? (
          <p className="sales-empty">
            با فیلترهای فعلی فاکتوری پیدا نشد. فیلترها را تغییر دهید یا فاکتور جدید بسازید.
          </p>
        ) : (
          <>
            <div className="sales-toolbar">
              <p className="sales-empty">
                نمایش {formatNumber(startRow)} تا {formatNumber(endRow)} از{' '}
                {formatNumber(listResult.totalCount)} فاکتور | مرتب سازی: {sortByLabel(query.sortBy)} (
                {query.sortDirection === 'asc' ? 'صعودی' : 'نزولی'})
              </p>
            </div>

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
                  {listResult.pagedInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className={selectedInvoice?.id === invoice.id ? 'sales-table__row--selected' : ''}
                    >
                      <td dir="ltr">{invoice.id}</td>
                      <td dir="ltr">{invoice.customer_id}</td>
                      <td>{formatDate(invoice.invoice_date)}</td>
                      <td>{formatNumber(invoice.total_amount)}</td>
                      <td>{statusLabel(invoice.status)}</td>
                      <td className="sales-table__actions">
                        <form action={confirmSalesInvoiceAction}>
                          <input type="hidden" name="invoice_json" value={JSON.stringify(invoice)} />
                          <button
                            type="submit"
                            className="sales-button sales-button--secondary"
                            disabled={invoice.status !== 'Draft'}
                          >
                            تایید
                          </button>
                        </form>
                        <a
                          className="sales-link"
                          href={buildSalesOpsHref(activeQuery, {
                            selectedInvoiceId: invoice.id,
                          })}
                        >
                          جزئیات
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <nav className="sales-pagination" aria-label="page navigation">
              {listResult.currentPage > 1 ? (
                <a
                  className="sales-link"
                  href={buildSalesOpsHref(activeQuery, {
                    page: listResult.currentPage - 1,
                  })}
                >
                  صفحه قبل
                </a>
              ) : (
                <span className="sales-link sales-link--disabled">صفحه قبل</span>
              )}
              <span className="sales-pagination__summary">
                صفحه {formatNumber(listResult.currentPage)} از {formatNumber(listResult.totalPages)}
              </span>
              {listResult.currentPage < listResult.totalPages ? (
                <a
                  className="sales-link"
                  href={buildSalesOpsHref(activeQuery, {
                    page: listResult.currentPage + 1,
                  })}
                >
                  صفحه بعد
                </a>
              ) : (
                <span className="sales-link sales-link--disabled">صفحه بعد</span>
              )}
            </nav>
          </>
        )}

        {showLoadingHint ? (
          <p className="sales-hint" aria-live="polite">
            در حال همگام سازی داده های فروش با API...
          </p>
        ) : null}
      </section>

      <section className="sales-card" aria-labelledby="sales-detail-title">
        <h2 id="sales-detail-title" className="sales-card__title">
          پنل جزئیات فاکتور انتخابی
        </h2>

        {hasListError ? (
          <p className="sales-empty">به دلیل خطای لیست، نمایش جزئیات فاکتور ممکن نیست.</p>
        ) : selectedInvoice === null ? (
          <p className="sales-empty">فاکتوری برای نمایش جزئیات انتخاب نشده است.</p>
        ) : (
          <div className="sales-movement-list">
            <article className="sales-movement-item">
              <h3 className="sales-movement-item__title">
                فاکتور <span dir="ltr">{selectedInvoice.id}</span>
              </h3>
              <ul className="sales-movement-item__rows">
                <li>
                  مشتری: <span dir="ltr">{selectedInvoice.customer_id}</span>
                </li>
                <li>تاریخ فاکتور: {formatDate(selectedInvoice.invoice_date)}</li>
                <li>وضعیت: {statusLabel(selectedInvoice.status)}</li>
                <li>مبلغ کل: {formatNumber(selectedInvoice.total_amount)}</li>
                <li>تعداد اقلام: {formatNumber(selectedInvoice.items.length)}</li>
              </ul>
            </article>

            <article className="sales-movement-item">
              <h3 className="sales-movement-item__title">اقلام فاکتور</h3>
              {selectedInvoice.items.length === 0 ? (
                <p className="sales-empty">این فاکتور هنوز آیتمی ندارد.</p>
              ) : (
                <div className="sales-table-wrapper">
                  <table className="sales-table sales-table--compact">
                    <thead>
                      <tr>
                        <th>کالا</th>
                        <th>تعداد</th>
                        <th>قیمت واحد</th>
                        <th>تخفیف</th>
                        <th>جمع سطر</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td dir="ltr">{item.product_id}</td>
                          <td>{formatNumber(item.quantity)}</td>
                          <td>{formatNumber(item.unit_price)}</td>
                          <td>{formatNumber(item.discount)}</td>
                          <td>{formatNumber(item.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>

            <article className="sales-movement-item">
              <h3 className="sales-movement-item__title">حرکت های انبار مرتبط</h3>
              {selectedInvoice.status !== 'Confirmed' ? (
                <p className="sales-empty">
                  این فاکتور هنوز تایید نشده است. پس از تایید، حرکت های خروجی انبار در این بخش دیده می شود.
                </p>
              ) : hasDetailError ? (
                <p className="sales-empty">
                  خطا: دریافت حرکت های انبار برای فاکتور انتخابی انجام نشد.
                </p>
              ) : stockMovements.length === 0 ? (
                <p className="sales-empty">برای این فاکتور تاییدشده، هنوز حرکتی ثبت نشده است.</p>
              ) : (
                <ul className="sales-movement-item__rows">
                  {stockMovements.map((movement) => (
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
          </div>
        )}
      </section>
    </section>
  );
}
