# MyVault AI 배포 가이드

## ⚠️ 중요: 현재 배포 상태

현재 **프론트엔드만** Vercel에 배포되어 있습니다.
**백엔드가 없어서** 앱이 정상 작동하지 않습니다!

---

## 🚀 올바른 배포 방법

### 옵션 1: 백엔드 + 프론트엔드 분리 배포 (권장)

#### 1️⃣ 백엔드 배포 (Render.com - 무료)

**Render.com에 백엔드 배포:**

1. [Render.com](https://render.com) 가입
2. "New +" → "Web Service" 클릭
3. GitHub 저장소 연결: `ggangminmin/Ai-story-board`
4. 설정:
   - **Name**: `myvault-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. 환경변수 추가:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ENCRYPTION_KEY=your_32_char_key
   NODE_ENV=production
   UPLOADS_DIR=/tmp/uploads
   DATA_DIR=/tmp
   FRONTEND_URL=https://ai-story-board-sable.vercel.app
   PORT=3001
   ```
6. "Create Web Service" 클릭
7. 배포 완료 후 URL 복사 (예: `https://myvault-backend.onrender.com`)

#### 2️⃣ 프론트엔드 Vercel 재배포

**Vercel에서 환경변수 설정:**

1. [Vercel Dashboard](https://vercel.com/dashboard)
2. `Ai-story-board` 프로젝트 선택
3. Settings → Environment Variables
4. 추가:
   ```
   VITE_API_URL=https://myvault-backend.onrender.com
   ```
5. Deployments → 최신 배포 → "Redeploy" 클릭

---

### 옵션 2: 전체를 Railway에 배포

Railway는 풀스택 앱 배포에 최적화되어 있습니다.

1. [Railway.app](https://railway.app) 가입
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택: `ggangminmin/Ai-story-board`
4. 환경변수 설정 (위와 동일)
5. 배포 완료!

---

### 옵션 3: 로컬에서만 사용

배포 없이 로컬에서만 사용:

```bash
# 터미널 1: 백엔드 실행
cd backend
npm run dev

# 터미널 2: 프론트엔드 실행
cd frontend
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 🔧 현재 문제 해결

**증상:** "노트를 불러오는데 실패했습니다" 에러

**원인:** 백엔드 API가 없음

**해결:** 위의 옵션 1 또는 2로 백엔드 배포 필요

---

## ⚠️ Vercel 무료 플랜 제약사항

- **파일 업로드**: 영구 저장 불가 (읽기 전용 파일시스템)
- **데이터베이스**: `data.json` 영구 저장 불가
- **권장**: AWS S3 + MongoDB/PostgreSQL 사용

---

## 📞 도움이 필요하신가요?

1. 백엔드를 Render에 배포하는 것이 가장 간단합니다
2. 완전한 프로덕션 환경이 필요하면 데이터베이스 마이그레이션 필요
3. 로컬 개발만 하려면 배포 불필요
