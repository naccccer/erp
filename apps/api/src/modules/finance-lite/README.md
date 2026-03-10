# Finance Lite Module

## Responsibility
The Finance Lite module manages basic financial tracking for operational documents.

It owns:
- payments
- installment plans
- installments
- cheques

It does NOT manage:
- full accounting ledger
- inventory movements

## Current Scope
- module skeleton
- contract folder placeholder
- register-payment use case
- Prisma persistence through `IPaymentRepository`

## Public Use Cases
- RegisterPayment

## Nest Wiring (Phase 19)
- `FinanceLiteModule` registers:
  - `RegisterPaymentUseCase`

## Infra Persistence (Phase 27)
- `PAYMENT_REPOSITORY` token is bound to `PrismaPaymentRepository`.
- `RegisterPaymentUseCase` persists payment records in Prisma instead of returning in-memory objects only.

## HTTP API (Phase 22)
- `POST /finance/payments` -> register payment record

## Permissions (Phase 26)
- `POST /finance/payments` requires `finance.payment.create`
