#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# --- Backend ---
echo "→ Setting up Python backend..."
cd "$ROOT/backend"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt

echo "→ Starting backend on http://localhost:8000 ..."
python main.py &
BACKEND_PID=$!

# --- Frontend ---
echo "→ Setting up frontend..."
cd "$ROOT/frontend"

if [ ! -d "node_modules" ]; then
  npm install
fi

echo "→ Starting frontend on http://localhost:5173 ..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✓ Dashboard running at http://localhost:5173"
echo "  Press Ctrl+C to stop both servers."
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
