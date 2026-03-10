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

## Phase 28 scope
- add real shell routes for `sales`, `purchasing`, `inventory`, and `finance`
- remove dead sidebar links and make active-state route-aware
- add a visible checkpoint panel on every operational page
- keep all page labels Farsi-first in RTL layout

## Phase 29 scope
- surface deterministic demo dataset IDs on purchasing/inventory/finance visibility pages
- keep seeded references visible in Farsi-first checkpoint blocks
- preserve RTL defaults while avoiding backend API contract changes

## Phase 30 scope
- add one shared Jalali date field component for active form pages
- convert Jalali selections to ISO payload values at the form/server-action boundary
- replace native date input usage in active sales form with the shared field
- keep displayed invoice dates in a consistent Jalali format

## Phase 31 scope
- replace purchasing placeholder content with a real create-draft + confirm workflow page
- use existing purchasing create/confirm endpoints and inventory movement lookup endpoint only
- show immediate purchasing checkpoint output (latest action + confirmed invoice inventory impact)
- keep seeded defaults (`default`, `supplier-1`, `product-1`) for practical demo flow stability

## Phase 32 scope
- replace finance placeholder content with payment registration workflow UI
- register payment through existing `POST /finance/payments` endpoint only
- replace inventory placeholder content with tenant-aware movement lookup by reference/invoice ID
- show explicit Farsi empty/error states for finance and inventory checkpoint panels

## Phase 33 scope
- normalize checkpoint pattern across `sales`, `purchasing`, `inventory`, `finance`
- keep tenant context visible and consistent in all operational checkpoint blocks
- standardize checkpoint action status (`idle`, `success`, `error`) in page-local workflow state
- tighten minimal responsive behavior for topbar/checkpoint/form actions on mobile

## Phase 35 scope
- upgrade sales page to an operations-first console (no backend contract change)
- add list filters (`tenant`, invoice id, customer id, status), sorting, and pagination
- add detail panel for selected invoice including invoice items and related inventory movements
- keep stable Farsi states for list/error/empty and detail/error/empty conditions

Constraints:
- reuse existing backend use-cases
- no new backend business logic
- keep UI intentionally simple
- keep implementation isolated to `apps/web`

## Notes
- UI is modular and local to `apps/web/src/modules/*`
- no business logic is implemented in this phase
- UI baseline is Farsi-first with RTL direction by default
- Sales page reads API base URL from `API_BASE_URL` (default: `http://localhost:3001`)
- Purchasing workflow page reads API base URL from `API_BASE_URL` and stores latest checkpoint state in an HTTP-only cookie scoped to `/purchasing`
- Finance workflow page reads API base URL from `API_BASE_URL` and stores latest checkpoint state in an HTTP-only cookie scoped to `/finance`
- Inventory lookup page reads API base URL from `API_BASE_URL` and stores latest lookup state in an HTTP-only cookie scoped to `/inventory`
- Shared checkpoint presentation component lives at `apps/web/src/modules/shared/components/visibility-checkpoint.tsx`
