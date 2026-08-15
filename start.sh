#!/usr/bin/env bash
set -e

# Start FastAPI backend on internal port 8000
echo "Starting FastAPI backend on :8000..."
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in $(seq 1 15); do
  if curl -s http://127.0.0.1:8000/ > /dev/null 2>&1; then
    echo "Backend ready."
    break
  fi
  sleep 1
done

# Start Express frontend server on $PORT (provided by Render/Railway)
echo "Starting Express frontend on :${PORT:-3000}..."
NODE_ENV=production API_TARGET=http://127.0.0.1:8000 node dist/server.cjs &
FRONTEND_PID=$!

echo "Simple Email is live."

# If either process exits, kill the other and exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGTERM SIGINT

wait -n $BACKEND_PID $FRONTEND_PID
EXIT_CODE=$?
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
exit $EXIT_CODE
