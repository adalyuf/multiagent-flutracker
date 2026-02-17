---
name: codex
description: Delegate a task to OpenAI Codex CLI for autonomous execution
argument-hint: <task description>
disable-model-invocation: true
allowed-tools: Bash
---

# Delegate to Codex

Run the following command to delegate the task to OpenAI Codex:

```
codex exec --dangerously-bypass-approvals-and-sandbox "$ARGUMENTS"
```

## Instructions

1. Run the `codex exec` command above using the Bash tool with a **10-minute timeout** (600000ms).
2. The `--dangerously-bypass-approvals-and-sandbox` flag is required because we are running inside a dev container where Docker access is needed.
3. Once Codex finishes, **read the output** and present a concise summary to the user:
   - What files were created or modified
   - Whether tests passed or failed
   - Any issues Codex encountered
4. If the output was truncated (saved to a file), read that file to get the full results.
5. If Codex made changes, verify them by inspecting the modified files or running relevant commands.
