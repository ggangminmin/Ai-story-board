# MyVault AI

AI 기반 개인 아카이브 웹앱 - 메모, 링크, 파일을 저장하고 AI가 자동으로 요약과 태그를 생성합니다.

## 주요 기능

- 자연어 메모 작성 및 저장
- 파일 업로드 (PDF, Word, Excel, PPT, 이미지 등)
- 링크 저장
- **AI 자동 요약** (OpenAI GPT-4o)
- **AI 자동 태그 생성**
- 검색 기능
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
- SQLite (better-sqlite3)
- Multer (파일 업로드)
- OpenAI API (GPT-4o)
- crypto-js (AES 암호화)

## 프로젝트 구조

```
MyVault-AI/
├── backend/
│   ├── src/
│   │   ├── server.ts          # Express 서버
│   │   ├── db.ts              # SQLite 데이터베이스 초기화
│   │   ├── routes/
│   │   │   └── notes.ts       # 노트 CRUD API
│   │   └── services/
│   │       └── openai.ts      # OpenAI API 연동
│   ├── uploads/               # 업로드된 파일 저장소
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # 메인 앱 컴포넌트
│   │   ├── main.tsx           # 엔트리 포인트
│   │   ├── pages/
│   │   │   ├── NotesListPage.tsx    # 메모 목록
│   │   │   ├── NewNotePage.tsx      # 메모 작성
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

### 🔧 수동 설치 (고급 사용자)

<details>
<summary>백엔드와 프론트엔드를 별도로 실행하려면 클릭</summary>

#### 백엔드 설정
```bash
cd backend
npm install
cp .env.example .env
# .env 파일을 열어서 OPENAI_API_KEY를 입력하세요
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

### 파일 업로드
- 지원 파일: PDF, Word, Excel, PowerPoint, 이미지 (JPG, PNG, GIF, WebP)
- 최대 파일 크기: 50MB
- 멀티 파일 업로드 지원

### 검색
메모 내용, 요약, 태그를 기준으로 검색할 수 있습니다.

## 데이터베이스 스키마

```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,           -- 메모 내용
  summary TEXT,                    -- AI 생성 요약
  tags TEXT,                       -- AI 생성 태그 (JSON 배열)
  link TEXT,                       -- 링크
  files TEXT,                      -- 파일 정보 (JSON 배열)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 보안

- crypto-js를 사용한 AES 암호화 기능 구현 (필요시 활성화)
- 파일 업로드 시 허용된 MIME 타입만 업로드 가능
- 파일 크기 제한 (50MB)

## 프로덕션 빌드

### 백엔드
```bash
cd backend
npm run build
npm start
```

### 프론트엔드
```bash
cd frontend
npm run build
npm run preview
```

## 라이선스

ISC

## 개발자

MyVault AI - 개인 아카이브 프로젝트

---

### 추가 개선 사항 (향후)

- [ ] 사용자 인증 및 로그인 기능
- [ ] 노트 편집 기능
- [ ] 태그별 필터링
- [ ] 파일 OCR 기능
- [ ] PDF 내용 추출 및 검색
- [ ] 다크 모드
- [ ] 모바일 반응형 개선
- [ ] 벡터 임베딩을 통한 시맨틱 검색
