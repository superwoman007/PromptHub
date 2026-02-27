#!/bin/bash
cd "$(dirname "$0")"
mkdir -p logs

echo "Starting PromptHub backend..."
cd backend
nohup node server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
cd ..

sleep 2

echo "Starting PromptHub frontend..."
cd frontend
nohup npx vite --host 0.0.0.0 --port 5174 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
cd ..

echo ""
echo "PromptHub started!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5174"
echo ""
