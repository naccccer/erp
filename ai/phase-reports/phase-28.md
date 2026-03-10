# Phase Report

## Phase
- number: 28
- title: Navigation + visibility shell hardening
- date: 2026-03-10

## Goal
- Make shell navigation fully functional with real module routes and per-page visibility checkpoints while preserving Farsi-first RTL defaults.

## Plan
- Replace dead sidebar links with real module routes and compute active state from current pathname.
- Add minimal real pages for purchasing, inventory, and finance, and add a visible checkpoint panel to every operational page including sales.

## Changed Files
- AGENTS.md
- ai/roadmap.md
- ai/roadmap-history.md
- apps/web/src/modules/shell/components/sidebar.tsx
- apps/web/src/modules/sales/components/sales-invoices-page.tsx
- apps/web/app/globals.css
- apps/web/app/purchasing/page.tsx
- apps/web/app/inventory/page.tsx
- apps/web/app/finance/page.tsx
- apps/web/src/modules/purchasing/components/purchasing-visibility-page.tsx
- apps/web/src/modules/inventory/components/inventory-visibility-page.tsx
- apps/web/src/modules/finance/components/finance-visibility-page.tsx
- apps/web/README.md
- ai/project-map.md
- ai/phase-reports/phase-28.md
- ai/phase-reports/latest.md

## Validation
- commands:
  - `pnpm --dir apps/web check`
- result:
  - pass: Next.js production build succeeded; routes `/sales`, `/purchasing`, `/inventory`, and `/finance` were generated successfully.

## Reviewer Gate
- plan_verdict: APPROVED
- diff_verdict: APPROVED
- approval_token: APR-20260310-28-DIFF

## Git Manager
- commit_message: phase 28: navigation visibility shell hardening
- commit_hash: none
- branch: unknown
- push_result: not-run

## Outcome
- Sidebar navigation now routes to real pages for sales, purchasing, inventory, and finance with route-aware active state.
- Every operational page now includes a visible checkpoint block that states visible data and latest load result.
- Pre-existing repository edits in `AGENTS.md`, `ai/roadmap.md`, and `ai/roadmap-history.md` were included in this phase commit by explicit user request.

## Next Phase
- 29 - Deterministic demo data seeding
