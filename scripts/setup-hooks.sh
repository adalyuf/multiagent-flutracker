#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ ! -x "$ROOT/.githooks/pre-commit" ]]; then
  echo "Expected executable hook not found: $ROOT/.githooks/pre-commit"
  exit 1
fi

if [[ ! -x "$ROOT/scripts/check-skill-parity.sh" ]]; then
  echo "Expected executable parity script not found: $ROOT/scripts/check-skill-parity.sh"
  exit 1
fi

git -C "$ROOT" config core.hooksPath .githooks

echo "Configured git hooks path to .githooks"
echo "Pre-commit now runs scripts/check-skill-parity.sh"
