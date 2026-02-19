#!/usr/bin/env bash
# agent-performance.sh [--format terminal|markdown] [--skip-reviews]
#
# Prints a performance report comparing AI agents' throughput, velocity,
# and quality metrics.  Uses the GitHub CLI (gh) to query issue and PR data.
#
# Agents are identified by their GitHub labels:
#   assigned:claude, assigned:codex, assigned:other

set -euo pipefail

# ---------- Configuration ----------
AGENTS=("claude" "codex" "other")
FORMAT="terminal"
SKIP_REVIEWS=false

# ---------- Argument parsing ----------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --format)      FORMAT="$2"; shift 2 ;;
    --skip-reviews) SKIP_REVIEWS=true; shift ;;
    --help|-h)
      echo "Usage: $0 [--format terminal|markdown] [--skip-reviews]"
      echo ""
      echo "Options:"
      echo "  --format       Output format: terminal (default) or markdown"
      echo "  --skip-reviews Skip the per-issue timeline API calls (faster)"
      exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

# ---------- Temp directory ----------
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"

# ---------- Rate limit check ----------
remaining=$(gh api rate_limit --jq '.rate.remaining')
if (( remaining < 100 )); then
  echo "GitHub API rate limit low ($remaining remaining). Aborting." >&2
  exit 1
fi

# ---------- Phase 1: Bulk fetch ----------
echo "Fetching issues..." >&2
gh issue list --state all --limit 500 \
  --json number,title,labels,state,createdAt,closedAt \
  > "$TMPDIR/issues.json"

echo "Fetching PRs..." >&2
gh pr list --state all --limit 500 \
  --json number,title,state,createdAt,mergedAt,closedAt,additions,deletions,body,headRefName \
  > "$TMPDIR/prs.json"

total_issues=$(jq 'length' "$TMPDIR/issues.json")
total_prs=$(jq 'length' "$TMPDIR/prs.json")

# ---------- Phase 2: Build issue→PR map ----------
# Parse "Closes #N" / "Fixes #N" / "Resolves #N" from PR bodies
jq -r '.[] | select(.body != null) |
  . as $pr |
  .body | [scan("(?i)(?:closes|fixes|resolves) #([0-9]+)")] | .[][0] |
  "\(.)	\($pr.number)"' "$TMPDIR/prs.json" > "$TMPDIR/issue_pr_map.tsv" 2>/dev/null || true

# ---------- Helper functions ----------

# Get the agent label for an issue number from the bulk data
agent_for_issue() {
  local issue_num=$1
  jq -r --argjson n "$issue_num" '
    .[] | select(.number == $n) |
    [.labels[].name | select(startswith("assigned:"))] |
    first // "unassigned"' "$TMPDIR/issues.json" | sed 's/assigned://'
}

# Get PR number for an issue from the map
pr_for_issue() {
  local issue_num=$1
  awk -F'\t' -v n="$issue_num" '$1 == n { print $2; exit }' "$TMPDIR/issue_pr_map.tsv"
}

# ---------- Phase 3: Compute throughput per agent ----------
for agent in "${AGENTS[@]}"; do
  label="assigned:$agent"

  # Closed issues
  closed=$(jq --arg l "$label" '
    [.[] | select(.state == "CLOSED") |
     select(.labels | map(.name) | index($l))] | length' "$TMPDIR/issues.json")

  # Open issues
  open=$(jq --arg l "$label" '
    [.[] | select(.state == "OPEN") |
     select(.labels | map(.name) | index($l))] | length' "$TMPDIR/issues.json")

  # Get all closed issue numbers for this agent
  jq -r --arg l "$label" '
    .[] | select(.state == "CLOSED") |
    select(.labels | map(.name) | index($l)) | .number' "$TMPDIR/issues.json" \
    > "$TMPDIR/${agent}_closed_issues.txt"

  # Count merged PRs and accumulate lines
  merged=0
  additions=0
  deletions=0
  test_inclusive=0
  total_prs_for_agent=0

  while IFS= read -r issue_num; do
    pr_num=$(pr_for_issue "$issue_num")
    [[ -z "$pr_num" ]] && continue
    total_prs_for_agent=$((total_prs_for_agent + 1))

    pr_data=$(jq --argjson n "$pr_num" '.[] | select(.number == $n)' "$TMPDIR/prs.json")
    pr_state=$(echo "$pr_data" | jq -r '.state')

    if [[ "$pr_state" == "MERGED" ]]; then
      merged=$((merged + 1))
      a=$(echo "$pr_data" | jq -r '.additions // 0')
      d=$(echo "$pr_data" | jq -r '.deletions // 0')
      additions=$((additions + a))
      deletions=$((deletions + d))

      # Check if PR touched test files
      pr_files=$(gh pr view "$pr_num" --json files --jq '.files[].path' 2>/dev/null || true)
      if echo "$pr_files" | grep -qiE '(test|spec)'; then
        test_inclusive=$((test_inclusive + 1))
      fi
    fi
  done < "$TMPDIR/${agent}_closed_issues.txt"

  # Compute completion rate
  total=$((closed + open))
  if (( total > 0 )); then
    completion=$(( (closed * 100) / total ))
  else
    completion="-"
  fi

  # Compute test-inclusive rate
  if (( merged > 0 )); then
    test_rate=$(( (test_inclusive * 100) / merged ))
  else
    test_rate="-"
  fi

  # Store throughput
  echo "$closed" > "$TMPDIR/${agent}_closed"
  echo "$open" > "$TMPDIR/${agent}_open"
  echo "$merged" > "$TMPDIR/${agent}_merged"
  echo "$additions" > "$TMPDIR/${agent}_additions"
  echo "$deletions" > "$TMPDIR/${agent}_deletions"
  echo "$completion" > "$TMPDIR/${agent}_completion"
  echo "$test_rate" > "$TMPDIR/${agent}_test_rate"
done

# ---------- Phase 4: Compute velocity per agent ----------
for agent in "${AGENTS[@]}"; do
  label="assigned:$agent"

  # Issue cycle times (hours)
  jq -r --arg l "$label" '
    [.[] | select(.state == "CLOSED") |
     select(.labels | map(.name) | index($l)) |
     select(.closedAt != null and .createdAt != null) |
     (((.closedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)) / 3600)] |
    if length == 0 then [] else sort end' "$TMPDIR/issues.json" \
    > "$TMPDIR/${agent}_cycle_times.json"

  # Extract stats
  count=$(jq 'length' "$TMPDIR/${agent}_cycle_times.json")
  if (( count > 0 )); then
    median=$(jq '.[length / 2 | floor] | . * 10 | round / 10' "$TMPDIR/${agent}_cycle_times.json")
    fastest=$(jq 'first | . * 10 | round / 10' "$TMPDIR/${agent}_cycle_times.json")
    slowest=$(jq 'last | . * 10 | round / 10' "$TMPDIR/${agent}_cycle_times.json")
  else
    median="-"; fastest="-"; slowest="-"
  fi

  # PR merge times (hours)
  pr_merge_times="[]"
  while IFS= read -r issue_num; do
    pr_num=$(pr_for_issue "$issue_num")
    [[ -z "$pr_num" ]] && continue
    pr_time=$(jq -r --argjson n "$pr_num" '
      .[] | select(.number == $n) |
      select(.mergedAt != null and .createdAt != null) |
      ((.mergedAt | fromdateiso8601) - (.createdAt | fromdateiso8601)) / 3600' "$TMPDIR/prs.json" 2>/dev/null || true)
    [[ -n "$pr_time" ]] && pr_merge_times=$(echo "$pr_merge_times" | jq --argjson t "$pr_time" '. + [$t]')
  done < "$TMPDIR/${agent}_closed_issues.txt"

  pr_count=$(echo "$pr_merge_times" | jq 'length')
  if (( pr_count > 0 )); then
    median_pr=$(echo "$pr_merge_times" | jq 'sort | .[length / 2 | floor] | . * 10 | round / 10')
  else
    median_pr="-"
  fi

  echo "$median" > "$TMPDIR/${agent}_median_cycle"
  echo "$fastest" > "$TMPDIR/${agent}_fastest"
  echo "$slowest" > "$TMPDIR/${agent}_slowest"
  echo "$median_pr" > "$TMPDIR/${agent}_median_pr"
done

# ---------- Phase 5: Compute quality (review rounds) ----------
if [[ "$SKIP_REVIEWS" == "false" ]]; then
  for agent in "${AGENTS[@]}"; do
    first_approval=0
    total_with_reviews=0
    total_rounds=0

    while IFS= read -r issue_num; do
      pr_num=$(pr_for_issue "$issue_num")
      [[ -z "$pr_num" ]] && continue

      echo "  Checking review history for issue #$issue_num..." >&2

      # Get label events from timeline
      label_events=$(gh api "repos/${REPO}/issues/${issue_num}/timeline" --paginate \
        --jq '[.[] | select(.event == "labeled") | .label.name]' 2>/dev/null || echo "[]")

      needs_review_count=$(echo "$label_events" | jq '[.[] | select(. == "needs-review")] | length')
      needs_changes_count=$(echo "$label_events" | jq '[.[] | select(. == "needs:changes")] | length')

      if (( needs_review_count > 0 )); then
        total_with_reviews=$((total_with_reviews + 1))
        total_rounds=$((total_rounds + needs_review_count))

        if (( needs_changes_count == 0 )); then
          first_approval=$((first_approval + 1))
        fi
      fi
    done < "$TMPDIR/${agent}_closed_issues.txt"

    if (( total_with_reviews > 0 )); then
      approval_rate=$(( (first_approval * 100) / total_with_reviews ))
      avg_rounds=$(awk "BEGIN { printf \"%.1f\", $total_rounds / $total_with_reviews }")
    else
      approval_rate="-"
      avg_rounds="-"
    fi

    echo "$approval_rate" > "$TMPDIR/${agent}_approval_rate"
    echo "$avg_rounds" > "$TMPDIR/${agent}_avg_rounds"
  done
fi

# ---------- Phase 6: Output ----------

# Helper to read a metric file
m() { cat "$TMPDIR/${1}_${2}" 2>/dev/null || echo "-"; }

# Append % to numeric values
pct() { local v=$(m "$1" "$2"); [[ "$v" == "-" ]] && echo "-" || echo "${v}%"; }

if [[ "$FORMAT" == "markdown" ]]; then
  echo "## Agent Performance Report"
  echo "**Period:** All time | **Repo:** $REPO"
  echo "**Issues:** $total_issues | **PRs:** $total_prs"
  echo ""
  echo "### Throughput"
  echo ""
  echo "| Agent | Closed | Open | PRs Merged | Lines(+) | Lines(-) | Completion |"
  echo "|-------|--------|------|------------|----------|----------|------------|"
  for agent in "${AGENTS[@]}"; do
    echo "| $agent | $(m $agent closed) | $(m $agent open) | $(m $agent merged) | $(m $agent additions) | $(m $agent deletions) | $(pct $agent completion) |"
  done

  echo ""
  echo "### Velocity (hours)"
  echo ""
  echo "| Agent | Median Cycle | Fastest | Slowest | Median PR→Merge |"
  echo "|-------|-------------|---------|---------|-----------------|"
  for agent in "${AGENTS[@]}"; do
    echo "| $agent | $(m $agent median_cycle) | $(m $agent fastest) | $(m $agent slowest) | $(m $agent median_pr) |"
  done

  echo ""
  echo "### Quality"
  echo ""
  echo "| Agent | 1st-Approval | Avg Rounds | Test-Inclusive |"
  echo "|-------|-------------|------------|----------------|"
  for agent in "${AGENTS[@]}"; do
    if [[ "$SKIP_REVIEWS" == "false" ]]; then
      echo "| $agent | $(pct $agent approval_rate) | $(m $agent avg_rounds) | $(pct $agent test_rate) |"
    else
      echo "| $agent | (skipped) | (skipped) | $(pct $agent test_rate) |"
    fi
  done

else
  # Terminal format
  echo ""
  echo "=== Agent Performance Report ==="
  echo "Period: All time | Repo: $REPO"
  echo "Issues: $total_issues | PRs: $total_prs"
  echo ""

  echo "--- Throughput ---"
  printf "%-10s %8s %6s %12s %10s %10s %12s\n" \
    "Agent" "Closed" "Open" "PRs Merged" "Lines(+)" "Lines(-)" "Completion"
  for agent in "${AGENTS[@]}"; do
    printf "%-10s %8s %6s %12s %10s %10s %12s\n" \
      "$agent" "$(m $agent closed)" "$(m $agent open)" "$(m $agent merged)" \
      "$(m $agent additions)" "$(m $agent deletions)" "$(pct $agent completion)"
  done
  echo ""

  echo "--- Velocity (hours) ---"
  printf "%-10s %14s %10s %10s %17s\n" \
    "Agent" "Median Cycle" "Fastest" "Slowest" "Median PR→Merge"
  for agent in "${AGENTS[@]}"; do
    printf "%-10s %14s %10s %10s %17s\n" \
      "$agent" "$(m $agent median_cycle)" "$(m $agent fastest)" "$(m $agent slowest)" "$(m $agent median_pr)"
  done
  echo ""

  echo "--- Quality ---"
  printf "%-10s %15s %12s %16s\n" \
    "Agent" "1st-Approval" "Avg Rounds" "Test-Inclusive"
  for agent in "${AGENTS[@]}"; do
    if [[ "$SKIP_REVIEWS" == "false" ]]; then
      printf "%-10s %15s %12s %16s\n" \
        "$agent" "$(pct $agent approval_rate)" "$(m $agent avg_rounds)" "$(pct $agent test_rate)"
    else
      printf "%-10s %15s %12s %16s\n" \
        "$agent" "(skipped)" "(skipped)" "$(pct $agent test_rate)"
    fi
  done
fi

echo ""
echo "Report complete." >&2
