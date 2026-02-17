---
name: build-feature
description: "Find open issues, choose one, create a worktree, implement and verify a fix, open a pull request."
---

# GitHub Assigned Issue PR

## Overview

Execute a consistent, end-to-end issue workflow with `gh` and `git`.
Prioritize correctness, minimal diffs, and explicit verification.

Work is always done in an isolated git worktree under `/workspace/.worktrees/<branch>`
so that multiple agents can operate simultaneously without interfering with each other.
The main `/workspace` checkout always stays on `main`.

## Preconditions

- Confirm repository remotes and branch status before editing.
- Confirm `gh auth status` succeeds.
- Leave unrelated local changes untouched.

## Workflow

1. Discover assigned issues.

- Run `gh issue list --label assigned:claude --state open`.
- If none are assigned, report that and stop.

2. Select the issue.

- Prefer issue labels or severity guidance if present.
- Read issue details with `gh issue view <number>`.
- Add the `assigned:claude` label if missing: `gh issue edit <number> --add-label assigned:claude`.

3. Create a worktree for the branch.

- Branch name: `fix/issue-<number>-<short-slug>`.
- Create the branch and worktree in one step:
  ```
  git -C /workspace worktree add /workspace/.worktrees/fix/issue-<number>-<short-slug> \
      -b fix/issue-<number>-<short-slug>
  ```
- All subsequent file reads, edits, and git commands operate inside
  `/workspace/.worktrees/fix/issue-<number>-<short-slug>`.

4. Implement fix.

- Make the smallest safe change that satisfies acceptance criteria.
- Update tests only when required by behavior changes.

5. Verify.

- Run focused tests first, then broader relevant tests (from within the worktree directory).
- Record pass/fail summary for PR notes.

6. Commit and push.

- Stage only intended files (run git commands from the worktree path).
- Write a specific commit message.
- Push: `git -C /workspace/.worktrees/fix/issue-<number>-<short-slug> push -u origin fix/issue-<number>-<short-slug>`.

7. Open PR.

- Create PR against `main` unless repo specifies another base.
- Include summary, testing, and `Closes #<number>`.

8. Apply review label.

- Add `needs-review` label to the PR and to the issue.

9. Clean up the worktree.

- Return to the parent directory, then remove the worktree:
  ```
  cd /workspace
  git -C /workspace worktree remove /workspace/.worktrees/fix/issue-<number>-<short-slug>
  ```

## PR Body Template

Use this structure:

```md
## Summary

- <change 1>
- <change 2>

## Testing

- `<command>`
- `<command>`

Closes #<issue-number>
```

## Guardrails

- Never `git switch` or `git checkout` in `/workspace`. Use worktrees only.
- Never include unrelated file changes in commits.
- Never remove or revert user changes you did not make.
- If tooling fails (for example, old `gh` behavior), use `gh api` fallback and verify resulting PR/labels explicitly.
- Always remove the worktree after the branch is pushed.
