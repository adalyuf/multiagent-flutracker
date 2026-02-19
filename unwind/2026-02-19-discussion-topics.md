# Strategic Discussion Topics — 2026-02-19

Based on a review of the 2026-02-18 work journal with fresh eyes.

---

## 1. Product vs. Process — Where is the effort going?

The journal is ~90% about **agent workflow infrastructure** (skill parity checkers, label cleanup scripts, issue-to-PR linkage helpers, base-state verification) and ~10% about the actual flu tracker. The agents are building an impressive CI/CD and coordination system, but the core product questions are barely discussed:
- Who uses this dashboard? What decisions does it inform?
- Is the data pipeline reliable and complete?
- Where is this deployed? Is anyone looking at it?

**Discussion**: Should we rebalance effort toward product features and data quality, or is the multi-agent workflow system itself a core goal of this project?

---

## 2. Data Pipeline Reliability

We just fixed two silent data bugs (missing country mappings, Decimal/float type mismatch in anomaly detection). Both were discovered by reading logs, not by any automated check. The journal doesn't mention:
- Data freshness monitoring or alerting
- Validation of ingested data (row counts, expected country coverage, date ranges)
- What happens when WHO or Nextstrain APIs are down or change format

**Discussion**: Should we add data pipeline health checks — e.g., a `/health` endpoint that reports last successful ingestion, record counts, and country coverage — so problems surface before someone reads logs?

---

## 3. Deployment and Production Readiness

There's zero mention of production deployment, hosting, domain, HTTPS, monitoring, error tracking (Sentry, etc.), or backup strategy. The app runs in Docker locally but:
- Is it deployed anywhere users can access it?
- What's the plan for getting it in front of people?
- Should there be a staging environment?

**Discussion**: What's the deployment target? A simple Railway/Fly.io deploy with a health check would make this a real product rather than a local demo.

---

## 4. The Dual Skill-File Architecture

The agents spent an extraordinary amount of time on `.claude/skills/` vs `skills/` drift — parity checkers, pre-commit hooks, CI gates, and multiple review cycles. This is a fundamental architecture problem being solved with tooling rather than by eliminating the duplication.

**Discussion**: Can we consolidate to a single source of truth for skill files? Symlinks, a build step that copies one to the other, or just picking one canonical location would eliminate an entire category of recurring work.

---

## 5. Frontend Visualization Trust

Several journal entries mention chart quality concerns:
- Y-axis scaling when forecast CI bands are wide
- CI band clipping without visual indication
- The `HistoricalChart` tests infer yMax from tick text (fragile)
- No real user feedback on whether the visualizations are actually useful

**Discussion**: What would make the dashboard compelling enough that someone checks it weekly? Better map interactivity? Comparative country analysis? Email/Slack alerts for anomalies? The current charts are technically functional but the journal hints they don't feel "trustworthy" yet.

---

## 6. Agent Coordination Model

The agents use a label-based queue system with alternating build/review roles. This works but has notable friction:
- Linear review latency (one PR at a time)
- Frequent rebase conflicts from parallel work on a small codebase
- Idle loops when everything is "in review"
- Significant infrastructure to avoid stepping on each other

**Discussion**: Is the two-agent model the right fit for this repo's size? Would a single agent with human review be more efficient? Or alternatively, should the agents work on more independent areas (e.g., one owns backend, one owns frontend)?

---

## 7. Test Strategy — Testing the Right Things

The test count went from 16 to 49+ in one day, but the journal reveals concerns about test quality:
- Dashboard tests use `Promise.any([...])` to handle multiple AlertBar states
- Chart tests infer scale values from rendered tick text
- E2E tests were written but couldn't be verified against a running stack

**Discussion**: Rather than maximizing test count, should we focus on a smaller set of high-confidence tests — particularly integration tests that seed the database and verify API responses end-to-end? That would catch the exact class of bugs we just fixed (wrong types, missing mappings).
