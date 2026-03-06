# Done Checklist

Before finishing a task, confirm all of these:

## Scope
- The change stayed inside the intended module as much as possible.
- No unrelated files were changed.
- No unnecessary refactor was introduced.

## Architecture
- Module boundaries were respected.
- No module directly changed another module's data.
- Prisma was used only in `infra/`.
- Contracts/events were used correctly.

## Code quality
- Names match project conventions.
- The code is simple and local, not overly generic.
- New logic is placed in the correct use-case folder.
- For frontend changes: UI is Farsi-first and RTL by default unless explicitly overridden by task scope.

## Tests
- A local test was added or updated.
- The changed behavior is covered.

## Contracts and docs
- Contracts were updated only if public behavior changed.
- Module README was updated if boundaries or outputs changed.

## Final review
- Diff is small and understandable.
- The task is complete.
- Stop here; do not continue beyond scope.

## Documentation

- Module README updated if responsibilities changed
- project-map updated if module boundaries changed
- contracts updated if events or public DTOs changed
- documentation remains consistent with implementation
