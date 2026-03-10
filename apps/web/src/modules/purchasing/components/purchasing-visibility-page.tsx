export function PurchasingVisibilityPage() {
  return (
    <section className="visibility-page" aria-labelledby="purchasing-page-title">
      <header className="visibility-page__header">
        <h1 id="purchasing-page-title" className="visibility-page__title">
          نمای ماژول خرید
        </h1>
        <p className="visibility-page__subtitle">
          این صفحه در فاز ۲۸ برای سخت سازی مسیر و مشاهده پذیری پوسته وب فعال شده است.
        </p>
      </header>

      <section className="sales-card" aria-labelledby="purchasing-visibility-summary-title">
        <h2 id="purchasing-visibility-summary-title" className="sales-card__title">
          خلاصه صفحه
        </h2>
        <p className="sales-empty">
          این مسیر به صورت واقعی در ناوبری فعال است و نقطه ورود ماژول خرید را بدون لینک مرده ارائه می کند.
        </p>
      </section>

      <section className="visibility-checkpoint" aria-labelledby="purchasing-checkpoint-title">
        <h2 id="purchasing-checkpoint-title" className="visibility-checkpoint__title">
          checkpoint مشاهده پذیری
        </h2>
        <p className="visibility-checkpoint__line">
          داده های نمایش داده شده: عنوان ماژول، توضیح محدوده فاز، و شناسه های دیتاست دمو خرید
        </p>
        <p className="visibility-checkpoint__line">
          آخرین نتیجه بارگذاری: دیتاست دمو خرید برای tenant پیش فرض نمایش داده شد
        </p>
      </section>

      <section className="sales-card" aria-labelledby="purchasing-demo-dataset-title">
        <h2 id="purchasing-demo-dataset-title" className="sales-card__title">
          داده دمو خرید (فاز ۲۹)
        </h2>
        <ul className="sales-movement-item__rows">
          <li>
            tenant: <span dir="ltr">default</span>
          </li>
          <li>
            تامین کننده فرم خرید: <span dir="ltr">supplier-1</span>
          </li>
          <li>
            کالای فرم خرید: <span dir="ltr">product-1</span>
          </li>
          <li>
            فاکتور تاییدشده: <span dir="ltr">purchase-invoice-1001</span>
          </li>
          <li>
            فاکتور پیش نویس: <span dir="ltr">purchase-invoice-1002</span>
          </li>
        </ul>
      </section>
    </section>
  );
}
