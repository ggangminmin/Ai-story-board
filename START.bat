@echo off
chcp 65001 >nul
cls
echo ====================================
echo MyVault AI 실행
echo ====================================
echo.

if not exist "backend\node_modules\" (
    echo [오류] 설치가 필요합니다!
    echo SETUP.bat 파일을 먼저 실행해주세요.
    echo.
    pause
    exit /b 1
)

if not exist "backend\.env" (
    echo [오류] .env 파일이 없습니다!
    echo SETUP.bat 파일을 먼저 실행해주세요.
    echo.
    pause
    exit /b 1
)

echo 백엔드 서버 시작 중... (http://localhost:3001)
echo 프론트엔드 서버 시작 중... (http://localhost:3000)
echo.
echo 브라우저에서 http://localhost:3000 으로 접속하세요!
echo 종료하려면 이 창을 닫으세요.
echo.
echo ====================================
echo.

start /B cmd /c "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
start /B cmd /c "cd frontend && npm run dev"

echo 서버가 실행 중입니다...
echo.
pause
