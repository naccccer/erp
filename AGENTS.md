# AGENTS.md

This repository is designed for AI-assisted development using Codex in Cursor.

The goal is predictable, small, safe changes.

---

# General Rules

- Use **pnpm** only.
- Keep diffs **small and focused**.
- Do **not refactor unrelated code**.
- Follow existing patterns before introducing new ones.
- Prefer **module-local code** over shared utilities.
- Stop when the requested task is complete.

---

# Architecture Rules

This project follows a **modular monolith** architecture.

Principles:

- Each module **owns its own data and logic**.
- Modules must **not modify another module's data directly**.
- Cross-module interaction happens via **events or contracts**.
- Multi-tenancy uses a **tenant_id** strategy.

---

# Backend Rules

- Prisma may be used **only inside `infra/`**.
- Controllers and use-cases **must not access Prisma directly**.
- One **use-case per folder**.
- DTOs should live **next to the use-case that uses them**.
- Use explicit naming such as:

CreateSalesInvoiceUseCase  
ConfirmSalesInvoiceUseCase

---

# Frontend Rules

- Keep UI components **module-local when possible**.
- Shared UI components must **not contain business logic**.
- Shared contracts must come from: `packages/contracts`
- Frontend UI must be **Farsi-first** by default.
- Frontend layout direction must be **RTL** by default unless a task explicitly requires otherwise.



---

# Workflow (Roadmap Driven)

If `ai/roadmap.md` exists:

1. Execute **only one phase at a time**
2. First generate a **short implementation plan**
3. Show the **files that will change**
4. Wait for approval (human or reviewer agent)
5. Implement the phase
6. Stop when the phase is finished

Never execute multiple roadmap phases at once.

---

# Scope Guard

- Do not modify unrelated modules.
- If a prerequisite outside the phase is required:
  - list it
  - stop.

---

# Documentation Rules

If a change affects behavior, architecture, or contracts:

Update:

- module `README.md`
- `ai/project-map.md`
- contracts in `packages/contracts`

Code and documentation must stay consistent.

---

# Completion Checklist

Before finishing any task:

- scope stayed inside the intended module
- no unrelated files changed
- naming follows project conventions
- tests were added or updated if behavior changed
