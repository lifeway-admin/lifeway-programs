#!/bin/bash
# Lifeway Programs — Start all services

echo "Starting Lifeway Programs services..."

# Kill any existing instances
pkill -f "uvicorn main:app" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "mirror.py --serve" 2>/dev/null

# Start CRM backend
cd "$(dirname "$0")/crm/backend"
python3 -m uvicorn main:app --port 8000 > /tmp/crm_backend.log 2>&1 &
echo "  CRM Backend  →  http://localhost:8000 (API docs: http://localhost:8000/docs)"

# Start CRM frontend
cd "$(dirname "$0")/crm/frontend"
npm run dev > /tmp/crm_frontend.log 2>&1 &
echo "  CRM Frontend →  http://localhost:5173"

# Start public booking app
cd "$(dirname "$0")/booking"
npm run dev > /tmp/booking.log 2>&1 &
echo "  Booking App  →  http://localhost:5174"

# Start lifeway marketing site
cd "$(dirname "$0")/lifeway"
npm run dev > /tmp/lifeway.log 2>&1 &
echo "  Marketing    →  http://localhost:5175"

# Start site mirror
cd "$(dirname "$0")"
python3 mirror.py --serve > /dev/null 2>&1 &
echo "  Site Mirror  →  http://localhost:8080"

echo ""
echo "Login: admin / lifeway2024"
echo "API key: add ANTHROPIC_API_KEY to crm/backend/.env to enable AI features"
echo ""
echo "Press Ctrl+C to stop all services."

wait
