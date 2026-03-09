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

## Public Use Cases
- RegisterPayment

## Nest Wiring (Phase 19)
- `FinanceLiteModule` registers:
  - `RegisterPaymentUseCase`

## HTTP API (Phase 22)
- `POST /finance/payments` -> register payment record
