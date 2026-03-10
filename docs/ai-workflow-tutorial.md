# راهنمای جریان کار AI در این ریپو

این راهنما توضیح می‌دهد:
- جریان اجرای فازها دقیقا چطور است
- هر قانون از کجا کنترل می‌شود
- اگر بخواهید روند را بهینه کنید، کدام فایل را باید تغییر دهید

---

## 1) جریان استاندارد اجرای فاز (مرحله‌به‌مرحله)

برای هر فاز roadmap این ترتیب را نگه دارید:

1. فقط یک فاز را انتخاب کن (`ai/roadmap.md`)
2. Plan کوتاه بده
3. فایل‌های هدف را شفاف لیست کن
4. گیت PLAN از `erp-reviewer`
5. پیاده‌سازی
6. اجرای تست/بیلد مرتبط
7. گیت DIFF از `erp-reviewer`
8. اجرای `git-manager` (stage -> commit -> push)
9. آپدیت گزارش‌ها:
   - `ai/phase-reports/phase-<number>.md`
   - `ai/phase-reports/latest.md`
10. توقف

نکته مهم: اجرای موازی چند فاز در sessionهای مختلف با قواعد فعلی توصیه نمی‌شود.

---

## 2) منبع هر قانون کجاست؟

### قوانین اصلی اجرا
- `AGENTS.md`
  - منبع اصلی رفتار agent در این ریپو
  - شامل: scope guard، frontend/backend rules، workflow roadmap-driven

### قانون‌های همیشه‌فعال Cursor
- `.cursor/rules/erp.mdc`
  - state machine اجرای فاز (`PLAN_REVIEW -> IMPLEMENT -> DIFF_REVIEW -> GIT`)
  - سیاست retry/escalation

### رفتار reviewer
- `.cursor/agents/erp-reviewer.md`
  - قرارداد ورودی/خروجی reviewer
  - شروط APPROVED/REJECTED

### رفتار git-manager
- `.cursor/agents/git-manager.md`
  - قرارداد handoff
  - قوانین commit/push و محدودیت stage

### قواعد کدنویسی
- `ai/coding-rules.md`
- `ai/done-checklist.md`

### نقشه محصول/معماری
- `ai/project-map.md`
- `ai/module-index.md`

### قالب و وضعیت گزارش فاز
- `ai/phase-report-template.md`
- `ai/phase-reports/latest.md`

---

## 3) اگر بخواهم چیزی را تغییر دهم، کدام فایل؟

### تغییر ترتیب یا سخت‌گیری اجرای فازها
- اول: `AGENTS.md`
- بعد: `.cursor/rules/erp.mdc`

### تغییر قرارداد reviewer (کلیدها، معیارها، خروجی)
- `.cursor/agents/erp-reviewer.md`

### تغییر سیاست git (فرمت commit، stage policy، push policy)
- `.cursor/agents/git-manager.md`

### تغییر تعریف کیفیت کد/تست/دامنه تغییرات
- `ai/coding-rules.md`
- `ai/done-checklist.md`

### تغییر خود roadmap (فازها، done criteria)
- `ai/roadmap.md`
- فازهای قدیمی: `ai/roadmap-history.md`

---

## 4) روال امن برای Tuning قوانین

پیشنهاد عملی:

1. یک شاخه مجزا بساز (مثلا `workflow-tuning`)
2. فقط فایل‌های rule/process را تغییر بده
3. تغییرات را کوچک و مستقل نگه دار
4. یک dry-run روی یک فاز کم‌ریسک انجام بده
5. اگر friction کمتر شد و quality افت نکرد، merge کن

---

## 5) الگوی درخواست خوب برای اجرای فاز

نمونه:

```text
Execute Phase <N> only.
Follow AGENTS.md strictly.
Show plan + files first.
Run reviewer PLAN gate, then implement.
Run relevant tests/build.
Run reviewer DIFF gate.
Run git-manager flow.
Update phase report files and stop.
```

---

## 6) خطاهای رایج

- شروع پیاده‌سازی قبل از PLAN approval
- اجرای چند فاز هم‌زمان
- تغییر فایل‌های خارج از scope فاز
- فراموش کردن `latest.md` در phase report
- commit کردن فایل‌هایی که reviewer تایید نکرده

---

## 7) چک‌لیست سریع قبل از پایان هر فاز

- فقط یک فاز اجرا شد
- تغییرات خارج از scope نداریم
- تست/بیلد مرتبط پاس شده
- reviewer PLAN و DIFF هر دو APPROVED
- git-manager اجرا شده
- `phase-<n>.md` و `latest.md` آپدیت شده‌اند

