export function FinanceVisibilityPage() {
  return (
    <section className="visibility-page" aria-labelledby="finance-page-title">
      <header className="visibility-page__header">
        <h1 id="finance-page-title" className="visibility-page__title">
          نمای ماژول مالی
        </h1>
        <p className="visibility-page__subtitle">
          این صفحه مسیر واقعی ماژول مالی را در پوسته فاز ۲۸ فعال نگه می دارد.
        </p>
      </header>

      <section className="sales-card" aria-labelledby="finance-visibility-summary-title">
        <h2 id="finance-visibility-summary-title" className="sales-card__title">
          خلاصه صفحه
        </h2>
        <p className="sales-empty">
          لینک مالی در ناوبری بدون استفاده از `#` به این صفحه متصل است و مسیر مرده وجود ندارد.
        </p>
      </section>

      <section className="visibility-checkpoint" aria-labelledby="finance-checkpoint-title">
        <h2 id="finance-checkpoint-title" className="visibility-checkpoint__title">
          checkpoint مشاهده پذیری
        </h2>
        <p className="visibility-checkpoint__line">
          داده های نمایش داده شده: عنوان ماژول، توضیح وضعیت صفحه، و شناسه پرداخت های دمو
        </p>
        <p className="visibility-checkpoint__line">
          آخرین نتیجه بارگذاری: پرداخت های seed شده برای مسیر مالی آماده بررسی هستند
        </p>
      </section>

      <section className="sales-card" aria-labelledby="finance-demo-dataset-title">
        <h2 id="finance-demo-dataset-title" className="sales-card__title">
          داده دمو مالی (فاز ۲۹)
        </h2>
        <ul className="sales-movement-item__rows">
          <li>
            پرداخت فروش: <span dir="ltr">payment-1001</span>
            {' -> '}
            <span dir="ltr">sales-invoice-1001</span>
          </li>
          <li>
            پرداخت خرید: <span dir="ltr">payment-1002</span>
            {' -> '}
            <span dir="ltr">purchase-invoice-1001</span>
          </li>
          <li>
            tenant پیش فرض: <span dir="ltr">default</span>
          </li>
        </ul>
      </section>
    </section>
  );
}
