# Start both frontend and backend servers
Write-Host "Starting BuildWithAi..." -ForegroundColor Cyan
Write-Host ""

# Start backend in background
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run server"

# Wait a bit for backend to start
Start-Sleep -Seconds 2

# Start frontend
Write-Host "Starting frontend dev server..." -ForegroundColor Green
npm run dev
