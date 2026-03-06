# Coding Rules

## General
- Prefer simple code over generic abstractions.
- Prefer explicit names over short names.
- Keep files small and focused.
- Avoid giant service files.
- Do not create cross-module dependencies unless required by contracts.

## Frontend localization baseline
- UI text must be Farsi by default.
- Page layout should use RTL direction by default.
- Use LTR only for technical tokens when needed (for example: code, numbers, IDs).
- Any non-Farsi UI must be explicitly requested by the task.

## Module structure
Each module should contain:
- README.md
- contract/
- entities/
- use-cases/
- api/
- infra/

## Use-case structure
Each use-case should live in its own folder:
- use-case.ts
- dto.ts
- test.ts

Optional:
- validator.ts
- mapper.ts

## Naming
Use consistent names:
- `SalesInvoice`
- `SalesInvoiceItem`
- `CreateSalesInvoiceUseCase`
- `ConfirmSalesInvoiceUseCase`
- `SalesInvoiceConfirmedEvent`

Avoid mixed naming like:
- bill
- voucher
- order service
unless the domain explicitly requires it.

## Prisma
- Prisma usage is allowed only in `infra/`.
- Domain/use-case/api layers must not import Prisma client directly.
- Map Prisma models to domain objects explicitly when needed.

## Contracts
Put shared contracts in `packages/contracts`:
- events
- permissions
- enums
- shared DTO shapes

Do not put business logic in contracts.

## Tests
- Every new use-case must have a local test.
- Update tests when behavior changes.
- Prefer focused tests near the changed code.

## Docs
Update module README if:
- ownership changes
- events change
- public use-cases change

Update contracts if:
- public event names change
- permission keys change
- shared DTO shape changes

## Scope control
When implementing a task:
- edit only the target module
- avoid unrelated cleanup
- avoid broad refactors
- prefer smallest working diff
