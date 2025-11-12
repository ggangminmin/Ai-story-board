# Render 백엔드 배포 가이드

## 🚀 빠른 시작 (5분)

### 1단계: Render 계정 생성

1. [Render.com](https://render.com) 접속
2. "Get Started" → GitHub 계정으로 가입

### 2단계: 백엔드 배포

1. Render Dashboard에서 **"New +"** 클릭
2. **"Web Service"** 선택
3. GitHub 저장소 연결:
   - "Connect a repository" 클릭
   - `ggangminmin/Ai-story-board` 선택
   - "Connect" 클릭

### 3단계: 서비스 설정

다음과 같이 입력:

| 항목 | 값 |
|------|-----|
| **Name** | `myvault-backend` |
| **Region** | Singapore (가장 가까움) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### 4단계: 환경변수 설정

"Environment" 섹션에서 "Add Environment Variable" 클릭하고 다음 추가:

```
NODE_ENV=production
PORT=3001
OPENAI_API_KEY=여기에_실제_OpenAI_API_키_입력
ENCRYPTION_KEY=32자_이상의_랜덤_문자열_입력
UPLOADS_DIR=/tmp/uploads
DATA_DIR=/tmp
FRONTEND_URL=https://ai-story-board-sable.vercel.app
```

**중요:**
- `OPENAI_API_KEY`: [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급
- `ENCRYPTION_KEY`: 32자 이상 랜덤 문자열 (예: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### 5단계: 배포!

1. **"Create Web Service"** 클릭
2. 자동으로 배포 시작 (약 3-5분 소요)
3. 배포 완료 후 URL 확인 (예: `https://myvault-backend.onrender.com`)

### 6단계: Vercel 프론트엔드 연결

백엔드 URL을 복사한 후:

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. `Ai-story-board` 프로젝트 클릭
3. **Settings** → **Environment Variables**
4. 새 변수 추가:
   ```
   Name: VITE_API_URL
   Value: https://myvault-backend.onrender.com
   ```
5. **Deployments** → 최신 배포 → **"Redeploy"** 클릭

---

## ✅ 완료 확인

1. 백엔드 헬스체크: `https://myvault-backend.onrender.com/api/health`
   - 응답: `{"status":"ok","message":"MyVault AI Server is running"}`

2. 프론트엔드: `https://ai-story-board-sable.vercel.app`
   - 메모 작성 및 저장 테스트

---

## ⚠️ 무료 플랜 제약사항

**Render 무료 플랜:**
- 15분 동안 요청이 없으면 자동으로 절전 모드
- 절전 모드에서 깨어나는데 30초-1분 소요
- 매월 750시간 무료 (충분함)

**해결책:**
- 유료 플랜 ($7/월) 사용
- 또는 절전 해제 서비스 사용 (예: UptimeRobot)

**데이터 저장:**
- 파일 업로드는 임시 저장만 가능 (`/tmp`)
- 재시작 시 업로드 파일 삭제됨
- 영구 저장 필요 시: AWS S3, Cloudinary 등 사용

---

## 🔧 문제 해결

### 배포 실패 시

1. Render Dashboard → Logs 확인
2. 빌드 에러: `npm install` 실행 확인
3. 시작 에러: 환경변수 설정 확인

### CORS 에러 발생 시

`FRONTEND_URL` 환경변수가 올바른지 확인:
```
FRONTEND_URL=https://ai-story-board-sable.vercel.app
```

### API 호출 실패 시

Vercel의 `VITE_API_URL`이 올바른지 확인

---

## 📞 추가 도움

배포 완료 후에도 문제가 있다면:
1. Render 로그 확인
2. 브라우저 콘솔 확인 (F12)
3. 환경변수 재확인
