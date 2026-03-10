import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { JalaliDateField } from '../../shared/components/jalali-date-field';
import { VisibilityCheckpoint } from '../../shared/components/visibility-checkpoint';
import { formatIsoToJalaliLabel } from '../../shared/date/jalali-date';
import {
  confirmPurchaseInvoice,
  createPurchaseInvoice,
  listInventoryMovements,
  type PurchaseInvoiceDto,
} from '../server/purchasing-api';
import {
  parsePurchasingWorkflowState,
  serializePurchasingWorkflowState,
  type PurchasingWorkflowState,
} from '../server/purchasing-workflow-state';

const DEFAULT_TENANT_ID = 'default';
const WORKFLOW_STATE_COOKIE = 'purchasing_workflow_state';

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

async function readWorkflowState(): Promise<PurchasingWorkflowState> {
  const cookieStore = await cookies();
  return parsePurchasingWorkflowState(cookieStore.get(WORKFLOW_STATE_COOKIE)?.value);
}

async function writeWorkflowState(nextState: PurchasingWorkflowState): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(WORKFLOW_STATE_COOKIE, serializePurchasingWorkflowState(nextState), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/purchasing',
    maxAge: 60 * 60 * 12,
  });
}

async function createPurchaseInvoiceAction(formData: FormData): Promise<void> {
  'use server';

  const tenantId = readText(formData, 'tenant_id', DEFAULT_TENANT_ID);

  try {
    const createdInvoice = await createPurchaseInvoice({
      tenant_id: tenantId,
      supplier_id: readText(formData, 'supplier_id', 'supplier-1'),
      invoice_date: parseInvoiceDateToIso(
        readText(formData, 'invoice_date', new Date().toISOString().slice(0, 10)),
      ),
      items: [
        {
          product_id: readText(formData, 'product_id', 'product-1'),
          quantity: Math.max(1, readNumber(formData, 'quantity', 1)),
          unit_cost: Math.max(0, readNumber(formData, 'unit_cost', 0)),
        },
      ],
    });

    await writeWorkflowState({
      last_action_result: `پیش نویس خرید ایجاد شد: ${createdInvoice.id}`,
      last_action_status: 'success',
      draft_invoice: createdInvoice,
      confirmed_invoice: null,
      inventory_movements: [],
    });
  } catch {
    const currentState = await readWorkflowState();
    await writeWorkflowState({
      ...currentState,
      last_action_result: 'ایجاد پیش نویس خرید با خطا مواجه شد. اتصال API را بررسی کنید.',
      last_action_status: 'error',
    });
  } finally {
    revalidatePath('/purchasing');
  }
}

async function confirmPurchaseInvoiceAction(formData: FormData): Promise<void> {
  'use server';

  const invoiceJson = readText(formData, 'invoice_json', '');
  if (!invoiceJson) {
    return;
  }

  let invoice: PurchaseInvoiceDto;
  try {
    invoice = JSON.parse(invoiceJson) as PurchaseInvoiceDto;
  } catch {
    const currentState = await readWorkflowState();
    await writeWorkflowState({
      ...currentState,
      last_action_result: 'داده فاکتور برای تایید نامعتبر است.',
      last_action_status: 'error',
    });
    revalidatePath('/purchasing');
    return;
  }

  try {
    const confirmed = await confirmPurchaseInvoice(invoice);
    const inventoryMovements = await listInventoryMovements(
      confirmed.invoice.id,
      confirmed.invoice.tenant_id,
    );

    await writeWorkflowState({
      last_action_result: `فاکتور ${confirmed.invoice.id} تایید شد و ${formatNumber(
        inventoryMovements.length,
      )} حرکت انبار برای آن یافت شد.`,
      last_action_status: 'success',
      draft_invoice: confirmed.invoice,
      confirmed_invoice: confirmed.invoice,
      inventory_movements: inventoryMovements,
    });
  } catch {
    const currentState = await readWorkflowState();
    await writeWorkflowState({
      ...currentState,
      last_action_result: 'تایید فاکتور خرید یا دریافت حرکت انبار با خطا مواجه شد.',
      last_action_status: 'error',
    });
  } finally {
    revalidatePath('/purchasing');
  }
}

export async function PurchasingVisibilityPage() {
  const workflowState = await readWorkflowState();
  const activeDraftInvoice =
    workflowState.draft_invoice && workflowState.draft_invoice.status === 'Draft'
      ? workflowState.draft_invoice
      : null;
  const confirmedInvoice = workflowState.confirmed_invoice;
  const tenantContext =
    activeDraftInvoice?.tenant_id ?? confirmedInvoice?.tenant_id ?? DEFAULT_TENANT_ID;

  return (
    <section className="sales-page" aria-labelledby="purchasing-page-title">
      <header className="sales-page__header">
        <h1 id="purchasing-page-title" className="sales-page__title">
          گردش کار خرید
        </h1>
        <p className="sales-page__subtitle">
          ایجاد پیش نویس، تایید فاکتور خرید و مشاهده نتیجه حرکت ورودی انبار
        </p>
      </header>

      <VisibilityCheckpoint
        titleId="purchasing-checkpoint-title"
        status={workflowState.last_action_status}
        dataSummary="داده های نمایش داده شده: نتیجه ایجاد پیش نویس خرید + وضعیت تایید فاکتور + نتیجه جستجوی حرکت انبار همان فاکتور"
        tenantId={tenantContext}
        lastResult={workflowState.last_action_result}
      />

      <section className="sales-card" aria-labelledby="purchasing-create-title">
        <h2 id="purchasing-create-title" className="sales-card__title">
          ایجاد پیش نویس فاکتور خرید
        </h2>

        <form action={createPurchaseInvoiceAction} className="sales-form">
          <label className="sales-field">
            <span>شناسه مستاجر</span>
            <input name="tenant_id" defaultValue={tenantContext} required />
          </label>

          <label className="sales-field">
            <span>شناسه تامین کننده</span>
            <input name="supplier_id" defaultValue="supplier-1" required />
          </label>

          <label className="sales-field">
            <span>تاریخ فاکتور</span>
            <JalaliDateField name="invoice_date" required />
          </label>

          <label className="sales-field">
            <span>شناسه کالا</span>
            <input name="product_id" defaultValue="product-1" required />
          </label>

          <label className="sales-field">
            <span>تعداد</span>
            <input name="quantity" type="number" min={1} step={1} defaultValue={1} required />
          </label>

          <label className="sales-field">
            <span>قیمت واحد خرید</span>
            <input name="unit_cost" type="number" min={0} step={1} defaultValue={0} required />
          </label>

          <button type="submit" className="sales-button">
            ایجاد پیش نویس
          </button>
        </form>
      </section>

      <section className="sales-card" aria-labelledby="purchasing-confirm-title">
        <h2 id="purchasing-confirm-title" className="sales-card__title">
          تایید پیش نویس خرید
        </h2>

        {activeDraftInvoice === null ? (
          <p className="sales-empty">
            هنوز پیش نویس فعالی برای تایید وجود ندارد. ابتدا از فرم بالا یک پیش نویس ایجاد کنید.
          </p>
        ) : (
          <div className="sales-movement-item">
            <h3 className="sales-movement-item__title">
              پیش نویس آماده تایید: <span dir="ltr">{activeDraftInvoice.id}</span>
            </h3>
            <ul className="sales-movement-item__rows">
              <li>
                تامین کننده: <span dir="ltr">{activeDraftInvoice.supplier_id}</span>
              </li>
              <li>تاریخ: {formatDate(activeDraftInvoice.invoice_date)}</li>
              <li>مبلغ کل: {formatNumber(activeDraftInvoice.total_amount)}</li>
            </ul>
            <form action={confirmPurchaseInvoiceAction}>
              <input type="hidden" name="invoice_json" value={JSON.stringify(activeDraftInvoice)} />
              <button type="submit" className="sales-button">
                تایید فاکتور
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="sales-card" aria-labelledby="purchasing-movement-title">
        <h2 id="purchasing-movement-title" className="sales-card__title">
          checkpoint حرکت انبار مرتبط
        </h2>

        {confirmedInvoice === null ? (
          <p className="sales-empty">
            بعد از تایید فاکتور، حرکت های ورودی انبار برای همان شناسه در این بخش نمایش داده می شود.
          </p>
        ) : (
          <div className="sales-movement-list">
            <article className="sales-movement-item">
              <h3 className="sales-movement-item__title">
                فاکتور تایید شده: <span dir="ltr">{confirmedInvoice.id}</span>
              </h3>
              <ul className="sales-movement-item__rows">
                <li>وضعیت فاکتور: {statusLabel(confirmedInvoice.status)}</li>
                <li>تاریخ فاکتور: {formatDate(confirmedInvoice.invoice_date)}</li>
                <li>تعداد حرکت های پیدا شده: {formatNumber(workflowState.inventory_movements.length)}</li>
              </ul>
            </article>

            {workflowState.inventory_movements.length === 0 ? (
              <p className="sales-empty">
                برای این فاکتور تاییدشده هنوز حرکت انباری ثبت نشده است یا هنوز قابل مشاهده نیست.
              </p>
            ) : (
              <article className="sales-movement-item">
                <h3 className="sales-movement-item__title">حرکت های انبار</h3>
                <ul className="sales-movement-item__rows">
                  {workflowState.inventory_movements.map((movement) => (
                    <li key={movement.id}>
                      نوع: {movement.movement_type} | کالا: <span dir="ltr">{movement.product_id}</span> |
                      تعداد: {formatNumber(movement.quantity)} | انبار:{' '}
                      <span dir="ltr">{movement.warehouse_id}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}
          </div>
        )}
      </section>
    </section>
  );
}
