# AI Workflow Tutorial (v2)

This guide defines the practical phase execution workflow for this repository.

## 1) Canonical phase flow

Use this order for every roadmap phase:

1. Select one phase from `ai/roadmap.md`.
2. Write a short implementation plan.
3. List the files that will change.
4. Wait for human approval.
5. Implement only the approved phase scope.
6. Run relevant checks/tests.
7. Run `git-manager` for commit-only execution.
8. Update phase reports:
   - `ai/phase-reports/phase-<number>.md`
   - `ai/phase-reports/latest.md`
9. Run `pnpm run phase-reports:archive`.
10. Stop.

Non-negotiables:
- one phase at a time
- small diffs
- no unrelated refactor
- module boundaries respected
- Prisma only in `infra/`

## 2) Git-manager gate and payload contract

Use git-manager only after implementation and validation.

Required payload keys:
- `phase`
- `verdict` (`APPROVED` only)
- `files` (approved changed files)

Rules:
- stage only approved phase files
- commit message format: `phase <number>: <short description>`
- commit only; do not push in this workflow

Expected git-manager output keys:
- `staged_files`
- `commit_message`
- `commit_hash`
- `branch`
- `commit_result`

## 3) Retry and escalation policy

Retry policy for non-human issues:
- start with `attempt = 1`
- if validation fails or git-manager rejects contract/scope, fix and retry
- max retries: `3`

Escalate immediately to human (no retry loop) when:
- merge conflicts appear
- branch permissions or protection block commit flow
- required work crosses approved phase scope

## 4) Where to change what

- `AGENTS.md`: canonical workflow authority and repo-level rules
- `.cursor/rules/erp.mdc`: always-on enforcement and state machine for Cursor
- `.cursor/agents/git-manager.md`: commit gate contract and git behavior
- `ai/roadmap.md`: active phase definitions and done criteria
- `ai/phase-report-template.md`: required report structure for each phase
- `ai/scripts/archive-phase-reports.cjs`: moves completed non-latest phase reports to archive
- `ai/tests/workflow-rules-consistency.test.cjs`: drift guard for workflow contract alignment
- `docs/run-tutorial.md`: quick operational runbook with workflow tutorial links

## 5) Quick checklist before closing a phase

- exactly one roadmap phase executed
- changed files match approved phase scope
- required tests/checks passed
- git-manager contract respected and commit completed (or explicitly deferred)
- phase report and latest report updated
- completed non-latest phase reports archived

## 6) Common mistakes to avoid

- implementing before human approval
- mixing tasks from multiple phases
- staging unrelated files in the phase commit
- forgetting to update `ai/phase-reports/latest.md`
- forgetting to run `pnpm run phase-reports:archive`
- leaving contradictions between `AGENTS.md` and `.cursor/rules/erp.mdc`
- reintroducing reviewer-agent dependencies in active workflow docs
