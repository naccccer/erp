## Phase
- number: 34
- title: Workflow review-centric v2 hardening
- date: 2026-03-10

## Goal
- Remove reviewer-agent dependencies from active workflow governance and enforce commit-only git-manager behavior with clear tutorial guidance and drift checks.

## Plan
- Align roadmap and governance artifacts to the v2 workflow (human approval + implement + validate + git-manager commit).
- Remove reviewer policy files and update active rules/docs to the new contract.
- Add workflow consistency test coverage and refresh phase reporting artifacts.

## Changed Files
- AGENTS.md
- .cursor/rules/erp.mdc
- .cursor/agents/git-manager.md
- .cursor/agents/erp-reviewer.md (deleted)
- ai/reviewer-rules.md (deleted)
- ai/roadmap.md
- ai/roadmap-history.md
- ai/phase-report-template.md
- ai/phase-reports/latest.md
- ai/phase-reports/phase-34.md
- docs/ai-workflow-tutorial.md
- docs/run-tutorial.md
- ai/tests/workflow-rules-consistency.test.cjs
- package.json

## Validation
- commands:
  - `pnpm run test:workflow-rules`
  - `pnpm run test:structure-drift`
- result:
  - pass: both commands completed successfully.

## Approval
- approval_type: human
- approval_status: approved
- approval_reference: user instruction on 2026-03-10 to implement Phase 34 plan.

## Git Manager
- verdict: NOT-RUN
- staged_files: none
- commit_message: phase 34: workflow review centric v2 hardening
- commit_hash: none
- branch: none
- commit_result: not-run

## Outcome
- Active workflow now uses human approval and git-manager commit-only flow, without reviewer-agent dependencies.
- Workflow tutorial and run tutorial links were updated, and consistency checks now guard against policy drift.

## Next Phase
- 35: TBD