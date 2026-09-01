#!/usr/bin/env bash
set -e

# Configurable internal port for FastAPI (default 8001 to avoid collision with Railway's $PORT)
INTERNAL_PORT="${INTERNAL_BACKEND_PORT:-8001}"

# Start FastAPI backend on internal port
echo "Starting FastAPI backend on :${INTERNAL_PORT}..."
uvicorn backend.app.main:app --host 127.0.0.1 --port ${INTERNAL_PORT} &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in $(seq 1 15); do
  if curl -s http://127.0.0.1:${INTERNAL_PORT}/ > /dev/null 2>&1; then
    echo "Backend ready."
    break
  fi
  sleep 1
done

# Start Express frontend server on $PORT (provided by Railway / Render / default 3000)
PUBLIC_PORT="${PORT:-3000}"
echo "Starting Express frontend on :${PUBLIC_PORT}..."
NODE_ENV=production API_TARGET="http://127.0.0.1:${INTERNAL_PORT}" PORT="${PUBLIC_PORT}" node dist/server.cjs &
FRONTEND_PID=$!

echo "Evergreen Email is live on port ${PUBLIC_PORT}."

# If either process exits, kill the other and exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGTERM SIGINT

wait -n $BACKEND_PID $FRONTEND_PID
EXIT_CODE=$?
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
exit $EXIT_CODE
