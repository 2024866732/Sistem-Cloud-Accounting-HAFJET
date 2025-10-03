@echo off
echo 🚀 Starting HAFJET Bukku Cloud Accounting System...
echo.

echo 📦 Installing Frontend Dependencies...
cd frontend
call npm install
echo.

echo 🔧 Starting Frontend Server...
start cmd /k "npm run dev"
echo.

echo 📦 Installing Backend Dependencies...
cd ..\backend
call npm install
echo.

echo 🔧 Starting Backend Server...
start cmd /k "npm run dev"
echo.

echo ✅ HAFJET Bukku is starting up!
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend API: http://localhost:3000
echo.
pause