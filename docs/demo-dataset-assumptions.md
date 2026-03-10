# Demo Dataset Assumptions (Phase 29)

این شناسه‌ها در Seed قطعی فاز ۲۹ استفاده می‌شوند و برای فرم‌های UI باید ثابت در نظر گرفته شوند.

## Tenant
- `tenant_id`: `default`

## Warehouses
- `warehouse-main` (کد: `WH-TEH-01`)

## Products
- `product-1` - کاغذ A4 (`PAPER-A4`)
- `product-2` - خودکار آبی (`PEN-BLUE`)

## Contacts
- مشتری‌ها:
  - `customer-1`
  - `customer-2`
- تامین‌کننده‌ها:
  - `supplier-1`
  - `supplier-2`

## Sales Invoices
- `sales-invoice-1001` (`Confirmed`, customer: `customer-1`)
- `sales-invoice-1002` (`Draft`, customer: `customer-2`)

## Purchase Invoices
- `purchase-invoice-1001` (`Confirmed`, supplier: `supplier-1`)
- `purchase-invoice-1002` (`Draft`, supplier: `supplier-2`)

## Stock Movements
- مرجع `opening-balance` برای موجودی اولیه
- مرجع `purchase-invoice-1001` برای ورود انبار خرید تایید شده
- مرجع `sales-invoice-1001` برای خروج انبار فروش تایید شده

## Payments
- `payment-1001` -> `sales-invoice-1001`
- `payment-1002` -> `purchase-invoice-1001`

## UI Form Defaults
- فروش:
  - `customer_id=customer-1`
  - `product_id=product-1`
- خرید (برای فازهای بعدی):
  - `supplier_id=supplier-1`
  - `product_id=product-1`
- tenant پیش‌فرض در صفحات عملیاتی: `default`
