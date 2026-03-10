export function InventoryVisibilityPage() {
  return (
    <section className="visibility-page" aria-labelledby="inventory-page-title">
      <header className="visibility-page__header">
        <h1 id="inventory-page-title" className="visibility-page__title">
          نمای ماژول انبار
        </h1>
        <p className="visibility-page__subtitle">
          این صفحه برای تثبیت ناوبری و دیدپذیری مسیر انبار در پوسته وب فعال شده است.
        </p>
      </header>

      <section className="sales-card" aria-labelledby="inventory-visibility-summary-title">
        <h2 id="inventory-visibility-summary-title" className="sales-card__title">
          خلاصه صفحه
        </h2>
        <p className="sales-empty">
          مسیر انبار به شکل واقعی از نوار کناری قابل دسترسی است و به یک صفحه فعال ختم می شود.
        </p>
      </section>

      <section className="visibility-checkpoint" aria-labelledby="inventory-checkpoint-title">
        <h2 id="inventory-checkpoint-title" className="visibility-checkpoint__title">
          checkpoint مشاهده پذیری
        </h2>
        <p className="visibility-checkpoint__line">
          داده های نمایش داده شده: عنوان ماژول، توضیح وضعیت مسیر، و ارجاع حرکات انبار دیتاست دمو
        </p>
        <p className="visibility-checkpoint__line">
          آخرین نتیجه بارگذاری: مسیر انبار روی داده های seed شده قابل راستی آزمایی است
        </p>
      </section>

      <section className="sales-card" aria-labelledby="inventory-demo-dataset-title">
        <h2 id="inventory-demo-dataset-title" className="sales-card__title">
          داده دمو انبار (فاز ۲۹)
        </h2>
        <ul className="sales-movement-item__rows">
          <li>
            انبار پیش فرض: <span dir="ltr">warehouse-main</span>
          </li>
          <li>
            موجودی اولیه مرجع: <span dir="ltr">opening-balance</span>
          </li>
          <li>
            ورود خرید تاییدشده: <span dir="ltr">purchase-invoice-1001</span>
          </li>
          <li>
            خروج فروش تاییدشده: <span dir="ltr">sales-invoice-1001</span>
          </li>
        </ul>
      </section>
    </section>
  );
}
