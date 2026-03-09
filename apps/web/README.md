# Web Module

This module contains the frontend shell for the ERP web app.

## Phase 17 scope
- app layout with shell wrapper
- sidebar navigation component
- topbar component
- one placeholder sales page

## Phase 17.5 scope
- replace placeholder with a minimal Sales Invoices page
- expose draft create flow from UI
- expose confirm invoice action from UI
- display resulting inventory stock movement from confirmation flow

## Phase 23 scope
- use live API endpoints instead of in-memory workflow
- create/list/confirm sales invoices through Phase 22 backend routes
- load inventory movements through `GET /inventory/movements?invoiceId=`
- keep the sales flow Farsi-first with RTL layout

Constraints:
- reuse existing backend use-cases
- no new backend business logic
- keep UI intentionally simple
- keep implementation isolated to `apps/web`

## Notes
- UI is modular and local to `apps/web/src/modules/*`
- no business logic is implemented in this phase
- UI baseline is Farsi-first with RTL direction by default
