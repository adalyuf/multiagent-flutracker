#!/usr/bin/env bash
set -euo pipefail

sudo chown -R node:node \
  /home/node/.config \
  /home/node/.claude \
  /home/node/.codex \
  /home/node/.railway

mkdir -p /home/node/.codex/skills

for skill in build-feature fix-pr review-claude-prs run-tests work; do
  rm -rf "/home/node/.codex/skills/${skill}"
  ln -s "/workspace/skills/${skill}" "/home/node/.codex/skills/${skill}"
done
