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
4. Wait for human approval
5. Implement the phase
6. Stop when the phase is finished

Never execute multiple roadmap phases at once.

---

# Sub-Agent Orchestration (Mandatory)

For roadmap phase execution, use `git-manager` after implementation and validation.

## Trigger contract for `git-manager`

Call only after human approval and implementation with:
- `phase`
- `verdict` (`APPROVED`)
- `files` (approved changed files)

Rules:
- Stage only approved phase files.
- Commit message format: `phase <number>: <short description>`.
- Commit only; do not push.
- Record git-manager output in phase report `Git Manager` section.

Default behavior:
- Treat this orchestration as always-on for new sessions.
- Do not wait for human reminder to invoke these agents.

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

---

# Phase Report Protocol

After completing each roadmap phase, always update:

- `ai/phase-reports/phase-<number>.md`
- `ai/phase-reports/latest.md`
- run `pnpm run phase-reports:archive` to move completed non-latest reports to `ai/phase-reports/archive`

Use `ai/phase-report-template.md` format.
This is mandatory even when phases are executed in separate sessions.
