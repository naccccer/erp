# Phase Report

## Phase
- number: 30
- title: Shared Shamsi (Jalali) date field
- date: 2026-03-10

## Goal
- Standardize Jalali date input UX in the web app while preserving ISO-compatible payloads for existing backend endpoints.

## Plan
- Add one reusable RTL Jalali date field in `apps/web` with client-side Jalali-to-ISO conversion at the form/server-action boundary.
- Replace active native date input usage in the sales form and unify displayed invoice date formatting in Jalali.

## Changed Files
- ai/project-map.md
- apps/web/README.md
- apps/web/app/globals.css
- apps/web/src/modules/sales/components/sales-invoices-page.tsx
- apps/web/src/modules/shared/components/jalali-date-field.tsx
- apps/web/src/modules/shared/date/jalali-date.ts
- apps/web/src/modules/shared/date/jalali-date.test.ts
- ai/phase-reports/phase-30.md
- ai/phase-reports/latest.md

## Validation
- commands:
  - `pnpm exec ts-node --project apps/web/tsconfig.json apps/web/src/modules/shared/date/jalali-date.test.ts`
  - `pnpm --dir apps/web exec tsc --noEmit`
  - `pnpm --dir apps/web run build`
- result:
  - pass: Jalali conversion test script passed, web TypeScript check passed, and Next.js production build succeeded.

## Reviewer Gate
- plan_verdict: APPROVED
- diff_verdict: APPROVED
- approval_token: APR-20260310-30-DIFF

## Git Manager
- commit_message: phase 30: shared jalali date field
- commit_hash: c650059
- branch: main
- push_result: success (initial proxy-based push failed, retry with per-command proxy override succeeded)

## Outcome
- Sales draft form now uses a shared Jalali date field (day/month/year selectors) instead of native Gregorian date input.
- Jalali selection is converted client-side to ISO (`...T00:00:00.000Z`) so existing sales API payload handling remains unchanged.
- Sales invoice date display now uses a shared Jalali formatter for consistent rendering.
- Known limitation: current shared date field exposes a centered 5-year Jalali range (current year ±2) by default.

## Next Phase
- 31 - Purchasing visibility workflow page
