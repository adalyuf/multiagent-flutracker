---
name: run-tests
description: Run the backend and frontend test suites and report results. Use when asked to run tests, verify a fix, or check that nothing is broken.
---

# Run Tests

## Overview

Execute the backend and frontend test suites and report a clear pass/fail
summary for each.

**Important:** The two suites run in different environments:

- **Backend** — run inside the `backend` Docker container via `docker compose exec`.
- **Frontend** — run directly on the host using the `node_modules/.bin/vitest`
  binary. The frontend Docker container is a production nginx image (multi-stage
  build); Node.js is not present in it and `docker compose exec frontend npm test`
  will fail with `npm: not found`.

## Preconditions

- Run all commands from `/workspace` (the repo root where `docker-compose.yml` lives).
- The `backend` container must be running for backend tests. Verify with `docker compose ps`.
- `node_modules` must be installed for frontend tests. They are pre-installed at
  `/workspace/frontend/node_modules`; no install step is needed in normal use.

## Workflow

### 1. Check backend container is up

```bash
docker compose ps
```

- Confirm the `backend` service shows as running.
- If it is missing, run `docker compose up -d backend` before proceeding.

### 2. Run backend tests

```bash
docker compose exec backend pytest
```

- pytest discovers and runs all tests under `/app/tests` inside the container.
- Capture the exit code and the summary line (e.g. `5 passed`, `2 failed`).
- If specific test files or markers are needed, append them:
  - Single file: `docker compose exec backend pytest tests/test_api_health.py`
  - Marker: `docker compose exec backend pytest -m <marker>`

### 3. Run frontend tests

```bash
cd /workspace/frontend && node_modules/.bin/vitest run
```

- Runs vitest in non-interactive mode (exits after one pass).
- Capture the exit code and the summary line (e.g. `39 passed`).
- If only a subset is needed, pass a file path or pattern:
  - `node_modules/.bin/vitest run src/__tests__/HistoricalChart.test.jsx`
  - `node_modules/.bin/vitest run --reporter=verbose`
- Do **not** use `docker compose exec frontend` — the frontend container is nginx
  and has no Node.js runtime.

### 4. Report results

Summarise both suites clearly:

```
Backend:  <N passed, M failed> — <exit code 0/1>
Frontend: <N passed, M failed> — <exit code 0/1>
```

- If either suite fails, list each failing test name and its error message.
- Do not truncate failure output; include enough detail for diagnosis.

## Guardrails

- Run backend tests inside the container; run frontend tests on the host.
- Do not modify test files or source code as part of running tests.
- If the backend container is unhealthy or crashes during the test run, report
  its logs (`docker compose logs backend`) rather than retrying blindly.
- Record the full exit code for each suite; exit code 0 means all tests passed.
