# Auth Module

## Responsibility
The Auth module manages identity and authorization foundations.

It owns:
- users
- roles
- permissions

## Tenant Strategy
- `tenant_id` is present on user and role records.
- Permission definitions are global keys reusable across tenants.

## Current Scope
- auth foundation entities
- module skeleton and placeholders
