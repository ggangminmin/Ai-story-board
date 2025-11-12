import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// 환경변수 기반 경로 설정
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

const dbPath = path.join(DATA_DIR, 'data.json');
const uploadsDir = UPLOADS_DIR;

// uploads 폴더 생성
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export { uploadsDir };

interface Note {
  id: number;
  content: string;
  summary: string | null;
  tags: string | null;
  link: string | null;
  link_description: string | null;
  files: string | null;
  embedding: string | null;
  favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface Database {
  notes: Note[];
  nextId: number;
}

// 데이터베이스 초기화
let db: Database = {
  notes: [],
  nextId: 1
};

// 데이터 로드
if (fs.existsSync(dbPath)) {
  try {
    const data = fs.readFileSync(dbPath, 'utf-8');
    db = JSON.parse(data);
  } catch (error) {
    console.error('데이터 로드 실패, 새로운 데이터베이스 생성');
  }
}

// 데이터 저장
function saveData() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

// DB 함수들
export const database = {
  // 전체 노트 조회
  getAllNotes: (): Note[] => {
    return db.notes.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // 단일 노트 조회
  getNoteById: (id: number): Note | undefined => {
    return db.notes.find(note => note.id === id);
  },

  // 노트 생성
  createNote: (data: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Note => {
    const now = new Date().toISOString();
    const newNote: Note = {
      id: db.nextId++,
      ...data,
      created_at: now,
      updated_at: now
    };
    db.notes.push(newNote);
    saveData();
    return newNote;
  },

  // 노트 수정
  updateNote: (id: number, data: Partial<Omit<Note, 'id' | 'created_at'>>): Note | null => {
    const index = db.notes.findIndex(note => note.id === id);
    if (index === -1) return null;

    db.notes[index] = {
      ...db.notes[index],
      ...data,
      updated_at: new Date().toISOString()
    };
    saveData();
    return db.notes[index];
  },

  // 노트 삭제
  deleteNote: (id: number): boolean => {
    const index = db.notes.findIndex(note => note.id === id);
    if (index === -1) return false;

    db.notes.splice(index, 1);
    saveData();
    return true;
  },

  // 검색
  searchNotes: (query: string): Note[] => {
    const lowerQuery = query.toLowerCase();
    return db.notes.filter(note =>
      note.content.toLowerCase().includes(lowerQuery) ||
      note.summary?.toLowerCase().includes(lowerQuery) ||
      note.tags?.toLowerCase().includes(lowerQuery)
    ).sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
};

console.log('Database initialized successfully (JSON-based)');
