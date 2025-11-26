# MyVault AI

AI 기반 개인 아카이브 웹앱 - 메모, 링크, 파일을 저장하고 AI가 자동으로 요약과 태그를 생성합니다.

## 주요 기능

- 자연어 메모 작성 및 저장
- **다중 링크 추가** - 제목, URL, 설명을 포함한 여러 링크 저장
- **다중 파일 업로드** - 제목, 설명을 포함한 여러 파일 업로드 (PDF, Word, Excel, PPT, 텍스트, 이미지 등)
- **AI 자동 요약** (OpenAI GPT-4o-mini)
- **AI 자동 태그 생성**
- **시맨틱 검색** - 벡터 임베딩을 활용한 의미 기반 검색
- **즐겨찾기/중요 표시** 기능
- **다크 모드** 지원
- 태그 필터링 및 정렬 기능
- 파일 다운로드 및 이미지 미리보기

## 기술 스택

### 프론트엔드
- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Vite

### 백엔드
- Node.js
- Express
- TypeScript
- **MongoDB** (MongoDB Atlas - 클라우드 데이터베이스)
- Multer (파일 업로드)
- OpenAI API (GPT-4o-mini + text-embedding-3-small)
- crypto-js (AES 암호화)

## 프로젝트 구조

```
MyVault-AI/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Express 서버
│   │   ├── db.ts              # MongoDB 연결 및 초기화
│   │   ├── routes/
│   │   │   └── notes.ts       # 노트 CRUD API
│   │   └── services/
│   │       └── openai.ts      # OpenAI API 연동 (요약, 태그, 임베딩)
│   ├── uploads/               # 업로드된 파일 저장소
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # 메인 앱 컴포넌트 (다크모드 지원)
│   │   ├── main.tsx           # 엔트리 포인트
│   │   ├── pages/
│   │   │   ├── NotesListPage.tsx    # 메모 목록 (필터, 정렬, 검색)
│   │   │   ├── NewNotePage.tsx      # 메모 작성 (다중 링크, 다중 파일)
│   │   │   ├── EditNotePage.tsx     # 메모 수정
│   │   │   └── ViewNotePage.tsx     # 메모 상세보기
│   │   └── types/
│   │       └── index.ts       # TypeScript 타입 정의
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 설치 및 실행 방법

### 🚀 빠른 시작 (권장)

**Windows 사용자:**
1. `START.bat` 파일을 더블클릭하세요!
2. 처음 실행 시 자동으로 설치가 진행됩니다.
3. OpenAI API Key를 입력하세요.
4. 브라우저에서 http://localhost:3000 으로 자동 접속됩니다.

**모든 플랫폼:**
```bash
# 1. 의존성 설치 및 설정 (처음 한 번만)
npm run setup

# 2. 서버 실행
npm start
```

그러면 자동으로 백엔드와 프론트엔드가 모두 실행됩니다!

### 📋 사전 요구사항

- Node.js 18 이상
- npm
- OpenAI API Key ([여기서 발급](https://platform.openai.com/api-keys))
- MongoDB Atlas 계정 및 클러스터 ([무료 가입](https://www.mongodb.com/cloud/atlas))

### 🔧 수동 설치 (고급 사용자)

<details>
<summary>백엔드와 프론트엔드를 별도로 실행하려면 클릭</summary>

#### 백엔드 설정
```bash
cd backend
npm install
cp .env.example .env
# .env 파일을 열어서 다음 정보를 입력하세요:
# - OPENAI_API_KEY: OpenAI API 키
# - MONGODB_URI: MongoDB Atlas 연결 문자열
npm run dev
```

#### 프론트엔드 설정
```bash
cd frontend
npm install
npm run dev
```
</details>

### 🌐 브라우저에서 접속

http://localhost:3000 으로 접속하여 앱을 사용할 수 있습니다.

## API 엔드포인트

### 노트 관련
- `GET /api/notes` - 전체 노트 조회
- `GET /api/notes/:id` - 특정 노트 조회
- `POST /api/notes` - 노트 생성 (파일 업로드 포함)
- `PUT /api/notes/:id` - 노트 수정
- `DELETE /api/notes/:id` - 노트 삭제
- `GET /api/notes/search/:query` - 노트 검색

### 기타
- `GET /api/health` - 서버 상태 확인
- `/uploads/*` - 업로드된 파일 제공

## 주요 기능 설명

### AI 자동 요약
메모를 저장할 때 OpenAI GPT-4o 모델이 내용을 분석하여 2-3문장의 간결한 요약을 자동으로 생성합니다.

### AI 자동 태그 생성

메모 내용에서 핵심 키워드를 추출하여 3-5개의 태그를 자동으로 생성합니다.

### 다중 링크 추가

- 제목, URL, 설명을 입력하여 링크 저장
- 여러 개의 링크를 하나의 노트에 추가 가능
- 링크 추가/삭제 버튼으로 동적 관리

### 다중 파일 업로드

- **지원 파일**: PDF, Word, Excel, PowerPoint, 텍스트(.txt), 이미지 (JPG, PNG, GIF, WebP)
- **파일 메타데이터**: 각 파일에 제목과 설명 추가 가능
- 최대 파일 크기: 50MB
- 여러 개의 파일을 하나의 노트에 업로드 가능
- AI가 파일 내용을 분석하여 자동 요약 생성

### 시맨틱 검색

- OpenAI text-embedding-3-small 모델을 사용한 벡터 임베딩
- 키워드 검색뿐만 아니라 의미적으로 유사한 메모 검색
- 메모 내용, 요약, 태그를 기준으로 검색

## 데이터베이스 스키마

### MongoDB Collection: notes

```typescript
{
  _id: ObjectId,
  content: string,              // 메모 내용
  summary: string | null,       // AI 생성 요약
  tags: string | null,          // AI 생성 태그 (JSON 배열)
  links: string | null,         // 링크 정보 (JSON 배열)
                                // [{ title, url, description }]
  files: string | null,         // 파일 정보 (JSON 배열)
                                // [{ title, originalname, filename,
                                //    mimetype, size, path, description, summary }]
  embedding: number[] | null,   // 벡터 임베딩 (시맨틱 검색용)
  favorite: boolean,            // 즐겨찾기 여부
  created_at: Date,
  updated_at: Date
}
```

## 보안

- crypto-js를 사용한 AES 암호화 기능 구현 (필요시 활성화)
- 파일 업로드 시 허용된 MIME 타입만 업로드 가능
- 파일 크기 제한 (50MB)

## 프로덕션 배포

### 배포된 앱

- **프론트엔드**: [Vercel](https://ai-story-board-bn514k57p-kangminseoks-projects.vercel.app/)
- **백엔드**: [Render](https://ai-story-board.onrender.com)

### 로컬 프로덕션 빌드

**백엔드**

```bash
cd backend
npm run build
npm start
```

**프론트엔드**

```bash
cd frontend
npm run build
npm run preview
```

### 배포 방법

**Vercel (프론트엔드)**

1. GitHub 리포지토리와 연결
2. 프로젝트 루트를 `frontend` 폴더로 설정
3. 환경 변수 `VITE_API_URL`에 백엔드 URL 입력
4. 자동 배포 활성화

**Render (백엔드)**

1. GitHub 리포지토리와 연결
2. 프로젝트 루트를 `backend` 폴더로 설정
3. 환경 변수 설정:
   - `OPENAI_API_KEY`: OpenAI API 키
   - `MONGODB_URI`: MongoDB Atlas 연결 문자열
   - `PORT`: 포트 번호 (기본값 5000)
4. 빌드 명령어: `npm install && npm run build`
5. 시작 명령어: `npm start`

## 라이선스

ISC

## 개발자

MyVault AI - 개인 아카이브 프로젝트

---

## 최근 업데이트

### 2025년 1월

- ✅ **다중 링크 지원** - 제목, URL, 설명이 포함된 여러 링크 추가/삭제 기능
- ✅ **다중 파일 업로드** - 제목과 설명이 포함된 여러 파일 업로드 기능
- ✅ **파일 메타데이터** - 각 파일에 제목과 설명을 추가하여 관리
- ✅ **텍스트 파일 지원** - .txt 파일 업로드 및 관리 기능 추가
- ✅ **다크 모드** - 전체 UI 다크 테마 지원
- ✅ **시맨틱 검색** - 벡터 임베딩을 활용한 의미 기반 검색
- ✅ **즐겨찾기 기능** - 중요한 메모를 즐겨찾기로 표시
- ✅ **태그 필터링** - 태그별로 메모 필터링
- ✅ **MongoDB 마이그레이션** - SQLite에서 MongoDB로 데이터베이스 변경

### 향후 개선 사항

- [ ] 사용자 인증 및 로그인 기능
- [ ] 노트 일괄 편집 기능
- [ ] 파일 OCR 기능
- [ ] PDF 내용 추출 및 검색
- [ ] 모바일 반응형 개선
- [ ] 노트 공유 기능
- [ ] 태그 자동완성
- [ ] 파일 미리보기 확대/축소
