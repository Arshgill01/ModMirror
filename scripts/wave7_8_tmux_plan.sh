#!/usr/bin/env bash
set -euo pipefail
SESSION="${1:-modmirror-wave7-8}"
if tmux has-session -t "$SESSION" 2>/dev/null; then
  echo "Session $SESSION already exists."
  exit 0
fi
tmux new-session -d -s "$SESSION" -n main
tmux send-keys -t "$SESSION:main" 'pwd && git status' C-m
tmux new-window -t "$SESSION" -n dev
tmux send-keys -t "$SESSION:dev" 'echo "Run npm run dev here when ready"' C-m
tmux new-window -t "$SESSION" -n tests
tmux send-keys -t "$SESSION:tests" 'echo "Run npm test / lint / type-check here when ready"' C-m
tmux new-window -t "$SESSION" -n qa
tmux send-keys -t "$SESSION:qa" 'echo "Use browser/Gemini/uncodexify QA notes here"' C-m
echo "Created tmux session: $SESSION"
echo "Attach with: tmux attach -t $SESSION"
