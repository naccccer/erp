const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function assertIncludes(content, expected, file, failures) {
  if (!content.includes(expected)) {
    failures.push(`[${file}] missing expected text: ${expected}`);
  }
}

function assertNotIncludes(content, blocked, file, failures) {
  if (content.includes(blocked)) {
    failures.push(`[${file}] contains blocked text: ${blocked}`);
  }
}

function run() {
  const failures = [];

  const agents = read('AGENTS.md');
  assertIncludes(agents, 'Wait for human approval', 'AGENTS.md', failures);
  assertIncludes(agents, 'Commit only; do not push.', 'AGENTS.md', failures);
  assertIncludes(agents, 'phase-reports:archive', 'AGENTS.md', failures);
  assertNotIncludes(agents, 'erp-reviewer', 'AGENTS.md', failures);
  assertNotIncludes(agents, 'approval_token', 'AGENTS.md', failures);

  const cursorRules = read('.cursor/rules/erp.mdc');
  assertIncludes(cursorRules, 'canonical workflow authority', '.cursor/rules/erp.mdc', failures);
  assertIncludes(cursorRules, 'PLAN -> HUMAN_APPROVAL -> IMPLEMENT -> VALIDATE -> GIT_COMMIT', '.cursor/rules/erp.mdc', failures);
  assertIncludes(cursorRules, 'Send git work to git-manager for commit-only execution', '.cursor/rules/erp.mdc', failures);
  assertNotIncludes(cursorRules, 'erp-reviewer', '.cursor/rules/erp.mdc', failures);
  assertNotIncludes(cursorRules, 'approval_token', '.cursor/rules/erp.mdc', failures);
  assertNotIncludes(cursorRules, 'commit and push', '.cursor/rules/erp.mdc', failures);

  const gitManager = read('.cursor/agents/git-manager.md');
  assertIncludes(gitManager, 'Never push as part of this workflow', '.cursor/agents/git-manager.md', failures);
  assertIncludes(gitManager, 'commit_result: <success|not_attempted|failed: reason>', '.cursor/agents/git-manager.md', failures);
  assertNotIncludes(gitManager, 'approval_token', '.cursor/agents/git-manager.md', failures);
  assertNotIncludes(gitManager, 'Push to the current branch upstream remote', '.cursor/agents/git-manager.md', failures);

  const workflowTutorial = read('docs/ai-workflow-tutorial.md');
  assertIncludes(workflowTutorial, 'Canonical phase flow', 'docs/ai-workflow-tutorial.md', failures);
  assertIncludes(workflowTutorial, 'Git-manager gate and payload contract', 'docs/ai-workflow-tutorial.md', failures);
  assertIncludes(workflowTutorial, 'Retry and escalation policy', 'docs/ai-workflow-tutorial.md', failures);
  assertIncludes(workflowTutorial, 'Where to change what', 'docs/ai-workflow-tutorial.md', failures);
  assertIncludes(workflowTutorial, 'Quick checklist before closing a phase', 'docs/ai-workflow-tutorial.md', failures);
  assertIncludes(workflowTutorial, 'Common mistakes to avoid', 'docs/ai-workflow-tutorial.md', failures);
  assertIncludes(workflowTutorial, 'phase-reports:archive', 'docs/ai-workflow-tutorial.md', failures);
  assertNotIncludes(workflowTutorial, 'erp-reviewer', 'docs/ai-workflow-tutorial.md', failures);

  const runTutorial = read('docs/run-tutorial.md');
  const workflowLinkMatches = runTutorial.match(/docs\/ai-workflow-tutorial\.md/g) || [];
  if (workflowLinkMatches.length < 2) {
    failures.push('[docs/run-tutorial.md] expected at least two visible references to docs/ai-workflow-tutorial.md');
  }

  if (exists('.cursor/agents/erp-reviewer.md')) {
    failures.push('[.cursor/agents/erp-reviewer.md] file must be deleted');
  }

  if (exists('ai/reviewer-rules.md')) {
    failures.push('[ai/reviewer-rules.md] file must be deleted');
  }

  if (!exists('ai/scripts/archive-phase-reports.cjs')) {
    failures.push('[ai/scripts/archive-phase-reports.cjs] file must exist');
  }

  if (failures.length > 0) {
    console.error('Workflow rules consistency check failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('Workflow rules consistency check passed.');
}

run();
