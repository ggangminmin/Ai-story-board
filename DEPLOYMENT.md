# MyVault AI - Vercel 배포 가이드

## 배포 전 준비사항

### 1. 환경변수 설정

#### Backend 환경변수 (`.env` 파일)
`backend/.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
PORT=3001
OPENAI_API_KEY=your_openai_api_key_here
ENCRYPTION_KEY=your_32_character_encryption_key
NODE_ENV=production
UPLOADS_DIR=./uploads
DATA_DIR=./
FRONTEND_URL=https://your-frontend-app.vercel.app
```

**중요 사항:**
- `OPENAI_API_KEY`: OpenAI API 키를 입력하세요
- `ENCRYPTION_KEY`: 32자 이상의 암호화 키를 생성하세요
- `FRONTEND_URL`: 프론트엔드가 배포될 Vercel URL로 변경하세요
- `NODE_ENV`: 프로덕션 환경에서는 `production`으로 설정

#### Frontend 환경변수
프론트엔드에서 백엔드 API URL을 사용하려면 `frontend/.env` 파일을 생성하세요:

```env
VITE_API_URL=https://your-backend-app.vercel.app
```

### 2. 파일 업로드 제한사항

**주의:** Vercel의 Serverless Functions는 파일 시스템이 읽기 전용입니다.

현재 프로젝트는 로컬 파일 시스템에 파일을 저장하도록 구성되어 있습니다. Vercel에 배포하려면 다음 중 하나를 선택해야 합니다:

#### 옵션 1: 외부 스토리지 사용 (권장)
- AWS S3, Cloudinary, Vercel Blob 등의 클라우드 스토리지 서비스 사용
- 파일 업로드 로직을 외부 스토리지로 변경 필요

#### 옵션 2: 파일 업로드 기능 비활성화
- 텍스트 노트와 링크만 사용
- 파일 첨부 기능 제거

#### 옵션 3: 별도의 서버 사용
- 백엔드를 Heroku, AWS EC2, DigitalOcean 등에 배포
- 파일 시스템을 직접 관리할 수 있는 환경 사용

### 3. 데이터베이스 제한사항

현재 프로젝트는 `data.json` 파일로 데이터를 저장합니다. Vercel의 읽기 전용 파일 시스템에서는 데이터를 영구적으로 저장할 수 없습니다.

**해결 방법:**
- MongoDB, PostgreSQL, MySQL 등의 외부 데이터베이스 사용
- Vercel의 Vercel Postgres 또는 Vercel KV 사용
- Supabase, PlanetScale 등의 클라우드 데이터베이스 서비스 사용

## Vercel 배포 방법

### 방법 1: Vercel CLI 사용

1. Vercel CLI 설치:
```bash
npm install -g vercel
```

2. 프로젝트 루트에서 로그인:
```bash
vercel login
```

3. 배포:
```bash
vercel
```

4. 프로덕션 배포:
```bash
vercel --prod
```

### 방법 2: Vercel Dashboard 사용

1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 연결
4. 프로젝트 설정:
   - Framework Preset: Other
   - Root Directory: `./`
5. 환경변수 추가 (Settings → Environment Variables):
   - `OPENAI_API_KEY`
   - `ENCRYPTION_KEY`
   - `NODE_ENV`
   - `FRONTEND_URL`
6. Deploy 클릭

## 환경변수 설정 (Vercel Dashboard)

배포 후 Vercel Dashboard에서 환경변수를 설정해야 합니다:

1. Project Settings → Environment Variables
2. 다음 변수들을 추가:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| OPENAI_API_KEY | your_openai_api_key | Production, Preview, Development |
| ENCRYPTION_KEY | your_32_char_key | Production, Preview, Development |
| NODE_ENV | production | Production |
| UPLOADS_DIR | /tmp/uploads | Production, Preview, Development |
| DATA_DIR | /tmp | Production, Preview, Development |
| FRONTEND_URL | https://your-app.vercel.app | Production |

## 로컬 개발 환경

### Backend 실행
```bash
cd backend
npm install
npm run dev
```

### Frontend 실행
```bash
cd frontend
npm install
npm run dev
```

### 프로덕션 빌드 테스트

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 주의사항

1. **.env 파일은 절대 Git에 커밋하지 마세요**
   - `.gitignore`에 이미 포함되어 있습니다
   - 대신 `.env.example` 파일을 참고하세요

2. **업로드된 파일**
   - `/uploads` 폴더는 Git에 포함되지 않습니다
   - Vercel에서는 임시 파일만 저장 가능 (`/tmp`)
   - 영구 저장이 필요하면 외부 스토리지 사용

3. **CORS 설정**
   - `FRONTEND_URL` 환경변수를 올바르게 설정해야 합니다
   - 프론트엔드와 백엔드가 다른 도메인일 경우 필수

4. **OpenAI API 키**
   - API 사용량과 비용을 모니터링하세요
   - OpenAI Dashboard에서 사용량 제한 설정 권장

## 트러블슈팅

### CORS 에러
- `FRONTEND_URL` 환경변수가 올바른지 확인
- 프론트엔드 URL에 trailing slash(/)가 없는지 확인

### 파일 업로드 실패
- Vercel은 읽기 전용 파일 시스템 사용
- 외부 스토리지 서비스로 마이그레이션 필요

### API 응답 없음
- 백엔드 로그 확인: Vercel Dashboard → Functions → Logs
- 환경변수가 올바르게 설정되었는지 확인

### 데이터가 저장되지 않음
- `data.json` 파일은 Vercel에서 영구 저장 불가
- 외부 데이터베이스로 마이그레이션 필요

## 다음 단계

프로덕션 환경에서 안정적으로 운영하려면:

1. **데이터베이스 마이그레이션**
   - MongoDB Atlas, Supabase, PlanetScale 등 사용
   - `backend/src/db.ts` 수정 필요

2. **파일 스토리지 마이그레이션**
   - AWS S3, Cloudinary, Vercel Blob 등 사용
   - `backend/src/routes/notes.ts`의 multer 설정 수정

3. **보안 강화**
   - 사용자 인증 시스템 추가
   - Rate limiting 구현
   - Input validation 강화

4. **모니터링**
   - Vercel Analytics 활성화
   - 에러 트래킹 서비스 연동 (Sentry 등)
