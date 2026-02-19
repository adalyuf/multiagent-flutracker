#!/usr/bin/env bash
set -euo pipefail

sudo chown -R node:node \
  /home/node/.config \
  /home/node/.claude \
  /home/node/.codex \
  /home/node/.railway \
  /home/node/.gemini

mkdir -p /home/node/.codex/skills
mkdir -p /home/node/.gemini/skills

# Install backend Python dependencies
cd /workspace/backend && pip install -r requirements.txt

# Install frontend dependencies and Playwright browsers
cd /workspace/frontend && npm install && npx playwright install
cd /workspace

for skill in build-feature fix-pr issue review-peer-prs unwind work; do
  # Link for Codex (backward compatibility)
  rm -rf "/home/node/.codex/skills/${skill}"
  ln -s "/workspace/skills/${skill}" "/home/node/.codex/skills/${skill}"
  
  # Link for Gemini
  rm -rf "/home/node/.gemini/skills/${skill}"
  ln -s "/workspace/skills/${skill}" "/home/node/.gemini/skills/${skill}"
done
