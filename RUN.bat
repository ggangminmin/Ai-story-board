@echo off
chcp 65001 >nul
cls
setlocal enabledelayedexpansion

echo ====================================
echo MyVault AI 자동 실행
echo ====================================
echo.

REM 1. 설치 확인 및 자동 설치
if not exist "backend\node_modules\" (
    echo [자동 설치] 패키지를 설치합니다...
    echo.

    echo [1/3] 백엔드 패키지 설치 중...
    cd backend
    call npm install --silent
    if errorlevel 1 (
        echo 백엔드 설치 실패! Node.js가 설치되어 있는지 확인하세요.
        pause
        exit /b 1
    )
    cd ..

    echo [2/3] 프론트엔드 패키지 설치 중...
    cd frontend
    call npm install --silent
    if errorlevel 1 (
        echo 프론트엔드 설치 실패!
        pause
        exit /b 1
    )
    cd ..

    echo [3/3] 업로드 폴더 생성...
    if not exist "backend\uploads" mkdir backend\uploads

    echo.
    echo 설치 완료!
    echo.
)

REM 2. .env 파일 확인 및 자동 생성
if not exist "backend\.env" (
    echo [환경 설정] OpenAI API Key가 필요합니다.
    echo.
    echo https://platform.openai.com/api-keys 에서 발급받을 수 있습니다.
    echo.
    set /p OPENAI_KEY="OpenAI API Key를 입력하세요: "

    if "!OPENAI_KEY!"=="" (
        echo API Key가 입력되지 않았습니다!
        pause
        exit /b 1
    )

    (
        echo PORT=3001
        echo OPENAI_API_KEY=!OPENAI_KEY!
        echo ENCRYPTION_KEY=myvault-ai-secret-key-change-this
    ) > backend\.env

    echo.
    echo 환경 설정 완료!
    echo.
)

REM 3. 서버 실행
echo ====================================
echo 서버를 시작합니다...
echo ====================================
echo.
echo 백엔드: http://localhost:3001
echo 프론트엔드: http://localhost:3000
echo.
echo 잠시 후 브라우저가 자동으로 열립니다...
echo 종료하려면 이 창을 닫으세요.
echo.

REM 백엔드 실행
start /B cmd /c "cd backend && npm run dev > nul 2>&1"

REM 프론트엔드 실행
start /B cmd /c "cd frontend && npm run dev > nul 2>&1"

REM 서버 시작 대기 (10초)
echo 서버 시작 대기 중...
timeout /t 10 /nobreak > nul

REM 브라우저 자동 실행
echo.
echo 브라우저를 엽니다...
start http://localhost:3000

echo.
echo ====================================
echo MyVault AI가 실행 중입니다!
echo ====================================
echo.
echo 브라우저에서 http://localhost:3000 을 사용하세요.
echo.
pause
