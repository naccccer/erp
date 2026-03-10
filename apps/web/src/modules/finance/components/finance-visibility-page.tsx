import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { JalaliDateField } from '../../shared/components/jalali-date-field';
import { VisibilityCheckpoint } from '../../shared/components/visibility-checkpoint';
import { formatIsoToJalaliLabel } from '../../shared/date/jalali-date';
import { registerPayment } from '../server/finance-api';
import {
  parseFinanceWorkflowState,
  serializeFinanceWorkflowState,
  type FinanceWorkflowState,
} from '../server/finance-workflow-state';

const DEFAULT_TENANT_ID = 'default';
const WORKFLOW_STATE_COOKIE = 'finance_workflow_state';

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

function parseIsoDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return new Date().toISOString();
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('fa-IR').format(value);
}

function formatDate(value: string): string {
  return formatIsoToJalaliLabel(value);
}

function referenceTypeLabel(referenceType: string): string {
  if (referenceType === 'sales_invoice') {
    return 'فاکتور فروش';
  }

  if (referenceType === 'purchase_invoice') {
    return 'فاکتور خرید';
  }

  return referenceType;
}

async function readWorkflowState(): Promise<FinanceWorkflowState> {
  const cookieStore = await cookies();
  return parseFinanceWorkflowState(cookieStore.get(WORKFLOW_STATE_COOKIE)?.value);
}

async function writeWorkflowState(nextState: FinanceWorkflowState): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(WORKFLOW_STATE_COOKIE, serializeFinanceWorkflowState(nextState), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/finance',
    maxAge: 60 * 60 * 12,
  });
}

async function registerPaymentAction(formData: FormData): Promise<void> {
  'use server';

  const tenantId = readText(formData, 'tenant_id', DEFAULT_TENANT_ID);
  const referenceId = readText(formData, 'reference_id', 'purchase-invoice-1001');

  try {
    const payment = await registerPayment({
      tenant_id: tenantId,
      reference_type: readText(formData, 'reference_type', 'purchase_invoice'),
      reference_id: referenceId,
      amount: Math.max(0, readNumber(formData, 'amount', 0)),
      paid_at: parseIsoDate(readText(formData, 'paid_at', new Date().toISOString())),
    });

    await writeWorkflowState({
      last_action_result: `پرداخت ${payment.id} با موفقیت ثبت شد.`,
      last_action_status: 'success',
      has_error: false,
      last_registered_payment: payment,
    });
  } catch {
    const currentState = await readWorkflowState();
    await writeWorkflowState({
      ...currentState,
      has_error: true,
      last_action_status: 'error',
      last_action_result: 'ثبت پرداخت با خطا مواجه شد. اتصال API و دسترسی tenant را بررسی کنید.',
    });
  } finally {
    revalidatePath('/finance');
  }
}

export async function FinanceVisibilityPage() {
  const workflowState = await readWorkflowState();
  const payment = workflowState.last_registered_payment;
  const tenantContext = payment?.tenant_id ?? DEFAULT_TENANT_ID;

  return (
    <section className="sales-page" aria-labelledby="finance-page-title">
      <header className="sales-page__header">
        <h1 id="finance-page-title" className="sales-page__title">
          ثبت پرداخت مالی
        </h1>
        <p className="sales-page__subtitle">
          ثبت پرداخت با endpoint فعلی مالی و نمایش checkpoint نتیجه عملیات
        </p>
      </header>

      <VisibilityCheckpoint
        titleId="finance-checkpoint-title"
        status={workflowState.last_action_status}
        dataSummary="داده های نمایش داده شده: نتیجه ثبت پرداخت + جزئیات پاسخ آخرین پرداخت ثبت شده"
        tenantId={tenantContext}
        lastResult={workflowState.last_action_result}
      />

      <section className="sales-card" aria-labelledby="finance-register-title">
        <h2 id="finance-register-title" className="sales-card__title">
          فرم ثبت پرداخت
        </h2>

        <form action={registerPaymentAction} className="sales-form">
          <label className="sales-field">
            <span>شناسه مستاجر</span>
            <input name="tenant_id" defaultValue={tenantContext} required />
          </label>

          <label className="sales-field">
            <span>نوع مرجع</span>
            <select name="reference_type" defaultValue="purchase_invoice" required>
              <option value="purchase_invoice">فاکتور خرید</option>
              <option value="sales_invoice">فاکتور فروش</option>
            </select>
          </label>

          <label className="sales-field">
            <span>شناسه مرجع</span>
            <input name="reference_id" defaultValue="purchase-invoice-1001" required />
          </label>

          <label className="sales-field">
            <span>مبلغ پرداخت</span>
            <input name="amount" type="number" min={0} step={1} defaultValue={1000000} required />
          </label>

          <label className="sales-field">
            <span>تاریخ پرداخت</span>
            <JalaliDateField name="paid_at" required />
          </label>

          <button type="submit" className="sales-button">
            ثبت پرداخت
          </button>
        </form>
      </section>

      <section className="sales-card" aria-labelledby="finance-response-title">
        <h2 id="finance-response-title" className="sales-card__title">
          checkpoint پاسخ ثبت پرداخت
        </h2>

        {payment === null ? (
          <p className="sales-empty">
            هنوز پرداختی از این صفحه ثبت نشده است. برای شروع، فرم بالا را ارسال کنید.
          </p>
        ) : (
          <article className="sales-movement-item">
            <h3 className="sales-movement-item__title">
              شناسه پرداخت: <span dir="ltr">{payment.id}</span>
            </h3>
            <ul className="sales-movement-item__rows">
              <li>
                tenant: <span dir="ltr">{payment.tenant_id}</span>
              </li>
              <li>نوع مرجع: {referenceTypeLabel(payment.reference_type)}</li>
              <li>
                شناسه مرجع: <span dir="ltr">{payment.reference_id}</span>
              </li>
              <li>مبلغ: {formatNumber(payment.amount)}</li>
              <li>تاریخ پرداخت: {formatDate(payment.paid_at)}</li>
              <li>وضعیت: {payment.status === 'Registered' ? 'ثبت شده' : 'لغو شده'}</li>
            </ul>
          </article>
        )}

        {workflowState.has_error ? (
          <p className="sales-empty">خطا: ثبت پرداخت انجام نشد و پاسخ معتبر از API دریافت نشد.</p>
        ) : null}
      </section>
    </section>
  );
}
