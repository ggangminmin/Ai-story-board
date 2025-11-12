@echo off
chcp 65001 >nul
cls
echo ====================================
echo MyVault AI 설치 프로그램
echo ====================================
echo.

echo [1/4] 백엔드 패키지 설치 중...
cd backend
call npm install
if errorlevel 1 (
    echo 백엔드 설치 실패!
    pause
    exit /b 1
)
cd ..
echo 완료!
echo.

echo [2/4] 프론트엔드 패키지 설치 중...
cd frontend
call npm install
if errorlevel 1 (
    echo 프론트엔드 설치 실패!
    pause
    exit /b 1
)
cd ..
echo 완료!
echo.

echo [3/4] 환경 변수 설정...
if exist "backend\.env" (
    echo .env 파일이 이미 존재합니다.
) else (
    echo.
    echo OpenAI API Key를 입력해주세요.
    echo (https://platform.openai.com/api-keys 에서 발급받을 수 있습니다)
    echo.
    set /p OPENAI_KEY="OpenAI API Key: "

    (
        echo PORT=3001
        echo OPENAI_API_KEY=!OPENAI_KEY!
        echo ENCRYPTION_KEY=myvault-ai-secret-key-change-this-in-production
    ) > backend\.env

    echo .env 파일 생성 완료!
)
echo.

echo [4/4] 업로드 폴더 생성...
if not exist "backend\uploads" mkdir backend\uploads
echo 완료!
echo.

echo ====================================
echo 설치가 완료되었습니다!
echo ====================================
echo.
echo 이제 START.bat 파일을 실행하세요!
echo.
pause
