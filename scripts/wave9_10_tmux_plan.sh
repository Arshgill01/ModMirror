#!/usr/bin/env bash
set -euo pipefail

SESSION="modmirror-wave9-10"

if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "tmux session $SESSION already exists."
  echo "Attach with: tmux attach -t $SESSION"
  exit 0
fi

tmux new-session -d -s "$SESSION" -n "codex"
tmux send-keys -t "$SESSION:codex" "pwd && git status" C-m

tmux new-window -t "$SESSION" -n "dev"
tmux send-keys -t "$SESSION:dev" "npm run dev" C-m

tmux new-window -t "$SESSION" -n "tests"
tmux send-keys -t "$SESSION:tests" "npm test -- --watch" C-m

tmux new-window -t "$SESSION" -n "build"
tmux send-keys -t "$SESSION:build" "npm run build && npm run type-check && npm run lint" C-m

tmux new-window -t "$SESSION" -n "goal"
tmux send-keys -t "$SESSION:goal" "sed -n '1,240p' prompts/wave9-10/WAVE9_10_MASTER_GOAL.md" C-m

echo "Created tmux session: $SESSION"
echo "Attach with: tmux attach -t $SESSION"
