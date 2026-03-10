# ERP Run Tutorial (Short)

این راهنما سریع‌ترین مسیر اجرای نسخه نمایشی ERP را نشان می‌دهد.

## پیش‌نیازها
1. Node.js و pnpm نصب باشد.
2. Docker برای PostgreSQL فعال باشد.
3. مسیر پروژه: `c:\xampp\htdocs\erp`

## اجرای سرویس‌ها
1. دیتابیس:
```powershell
docker start erp-postgres
```

2. متغیر اتصال دیتابیس:
```powershell
$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/erp?schema=public'
```

3. اعمال migration:
```powershell
pnpm exec prisma migrate deploy
```

4. ریست و بازتولید داده دمو (تکرارپذیر):
```powershell
pnpm run seed:demo:reset
```

5. اجرای API:
```powershell
pnpm run dev:api
```

6. اجرای Web (در ترمینال جدا):
```powershell
pnpm run dev:web
```

7. آدرس‌ها:
- Web: `http://localhost:3000`
- API: `http://localhost:3001`

## دستورات Seed
- بازتولید قطعی داده دمو (به‌صورت tenant محور برای `default`):
```powershell
pnpm run seed:demo
```

- ریست و بازتولید (معادل همین فاز):
```powershell
pnpm run seed:demo:reset
```

## بررسی سریع API
```powershell
Invoke-WebRequest 'http://localhost:3001/sales/invoices?tenant_id=default' -Headers @{ 'x-tenant-id'='default'; 'x-role'='manager' }
```

## شناسه‌های دمو برای فرم‌های UI
جزئیات کامل شناسه‌ها در فایل زیر نگهداری می‌شود:
- `docs/demo-dataset-assumptions.md`

## راهنمای جریان کار AI
برای اینکه بدانید جریان اجرای فازها چیست و قوانین را از کجا باید تغییر دهید:
- `docs/ai-workflow-tutorial.md`
