import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { VisibilityCheckpoint } from '../../shared/components/visibility-checkpoint';
import { formatIsoToJalaliLabel } from '../../shared/date/jalali-date';
import { listInventoryMovementsByReference } from '../server/inventory-api';
import {
  parseInventoryLookupState,
  serializeInventoryLookupState,
  type InventoryLookupState,
} from '../server/inventory-lookup-state';

const WORKFLOW_STATE_COOKIE = 'inventory_lookup_state';

function readText(formData: FormData, key: string, fallback: string): string {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function formatDate(value: string): string {
  return formatIsoToJalaliLabel(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}

async function readLookupState(): Promise<InventoryLookupState> {
  const cookieStore = await cookies();
  return parseInventoryLookupState(cookieStore.get(WORKFLOW_STATE_COOKIE)?.value);
}

async function writeLookupState(nextState: InventoryLookupState): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(WORKFLOW_STATE_COOKIE, serializeInventoryLookupState(nextState), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/inventory',
    maxAge: 60 * 60 * 12,
  });
}

async function lookupMovementsAction(formData: FormData): Promise<void> {
  'use server';

  const tenantId = readText(formData, 'tenant_id', 'default');
  const referenceId = readText(formData, 'reference_id', 'purchase-invoice-1001');

  if (!referenceId) {
    await writeLookupState({
      tenant_id: tenantId,
      reference_id: referenceId,
      last_action_result: 'شناسه مرجع برای جستجو الزامی است.',
      last_action_status: 'error',
      has_error: true,
      movements: [],
    });
    revalidatePath('/inventory');
    return;
  }

  try {
    const movements = await listInventoryMovementsByReference(referenceId, tenantId);
    const resultMessage =
      movements.length === 0
        ? `برای مرجع ${referenceId} در tenant ${tenantId} حرکتی یافت نشد.`
        : `${formatNumber(movements.length)} حرکت برای مرجع ${referenceId} یافت شد.`;

    await writeLookupState({
      tenant_id: tenantId,
      reference_id: referenceId,
      last_action_result: resultMessage,
      last_action_status: 'success',
      has_error: false,
      movements,
    });
  } catch {
    await writeLookupState({
      tenant_id: tenantId,
      reference_id: referenceId,
      last_action_result: 'دریافت حرکات انبار با خطا مواجه شد. اتصال API یا tenant را بررسی کنید.',
      last_action_status: 'error',
      has_error: true,
      movements: [],
    });
  } finally {
    revalidatePath('/inventory');
  }
}

export async function InventoryVisibilityPage() {
  const lookupState = await readLookupState();

  return (
    <section className="sales-page" aria-labelledby="inventory-page-title">
      <header className="sales-page__header">
        <h1 id="inventory-page-title" className="sales-page__title">
          استعلام حرکات انبار
        </h1>
        <p className="sales-page__subtitle">
          جستجوی حرکات انبار با شناسه مرجع یا شناسه فاکتور در context مستاجر
        </p>
      </header>

      <VisibilityCheckpoint
        titleId="inventory-checkpoint-title"
        status={lookupState.last_action_status}
        dataSummary="داده های نمایش داده شده: tenant + مرجع جستجو + نتیجه آخرین استعلام + لیست حرکات"
        tenantId={lookupState.tenant_id}
        lastResult={lookupState.last_action_result}
      />

      <section className="sales-card" aria-labelledby="inventory-lookup-title">
        <h2 id="inventory-lookup-title" className="sales-card__title">
          فرم استعلام حرکت
        </h2>

        <form action={lookupMovementsAction} className="sales-form">
          <label className="sales-field">
            <span>شناسه مستاجر</span>
            <input name="tenant_id" defaultValue={lookupState.tenant_id} required />
          </label>

          <label className="sales-field">
            <span>شناسه مرجع / فاکتور</span>
            <input name="reference_id" defaultValue={lookupState.reference_id} required />
          </label>

          <button type="submit" className="sales-button">
            استعلام حرکت ها
          </button>
        </form>
      </section>

      <section className="sales-card" aria-labelledby="inventory-result-title">
        <h2 id="inventory-result-title" className="sales-card__title">
          نتیجه استعلام
        </h2>

        <p className="sales-empty">
          tenant فعال: <span dir="ltr">{lookupState.tenant_id}</span> | مرجع جستجو:{' '}
          <span dir="ltr">{lookupState.reference_id}</span>
        </p>

        {lookupState.has_error ? (
          <p className="sales-empty">
            خطا: دریافت داده انجام نشد. سرویس API یا هدرهای tenant را بررسی کنید.
          </p>
        ) : lookupState.movements.length === 0 ? (
          <p className="sales-empty">
            برای این مرجع حرکتی ثبت نشده است. می توانید `purchase-invoice-1001` یا
            `sales-invoice-1001` را هم بررسی کنید.
          </p>
        ) : (
          <div className="sales-movement-list">
            {lookupState.movements.map((movement) => (
              <article key={movement.id} className="sales-movement-item">
                <h3 className="sales-movement-item__title">
                  حرکت: <span dir="ltr">{movement.id}</span>
                </h3>
                <ul className="sales-movement-item__rows">
                  <li>نوع حرکت: {movement.movement_type}</li>
                  <li>
                    کالا: <span dir="ltr">{movement.product_id}</span>
                  </li>
                  <li>تعداد: {formatNumber(movement.quantity)}</li>
                  <li>
                    انبار: <span dir="ltr">{movement.warehouse_id}</span>
                  </li>
                  <li>
                    مرجع: <span dir="ltr">{movement.reference_id ?? '-'}</span>
                  </li>
                  <li>زمان رخداد: {formatDate(movement.occurred_at)}</li>
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
