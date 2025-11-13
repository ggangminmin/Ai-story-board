import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Note, { INote } from './models/Note';

dotenv.config();

// 환경변수 기반 경로 설정
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..');
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

const uploadsDir = UPLOADS_DIR;

// uploads 폴더 생성
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export { uploadsDir };

// MongoDB 연결
const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('⚠️  MONGODB_URI is not set in environment variables');
  console.log('Falling back to JSON-based storage (temporary)');
} else {
  mongoose
    .connect(MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      console.log('Falling back to JSON-based storage (temporary)');
    });
}

// DB 함수들
export const database = {
  // 전체 노트 조회
  getAllNotes: async (): Promise<INote[]> => {
    try {
      return await Note.find().sort({ created_at: -1 });
    } catch (error) {
      console.error('getAllNotes error:', error);
      return [];
    }
  },

  // 단일 노트 조회
  getNoteById: async (id: string): Promise<INote | null> => {
    try {
      return await Note.findById(id);
    } catch (error) {
      console.error('getNoteById error:', error);
      return null;
    }
  },

  // 노트 생성
  createNote: async (data: {
    content: string;
    summary?: string | null;
    tags?: string | null;
    link?: string | null;
    link_description?: string | null;
    files?: string | null;
    embedding?: string | null;
    favorite?: boolean;
  }): Promise<INote> => {
    try {
      const note = new Note(data);
      return await note.save();
    } catch (error) {
      console.error('createNote error:', error);
      throw error;
    }
  },

  // 노트 수정
  updateNote: async (
    id: string,
    data: Partial<{
      content: string;
      summary: string | null;
      tags: string | null;
      link: string | null;
      link_description: string | null;
      files: string | null;
      embedding: string | null;
      favorite: boolean;
    }>
  ): Promise<INote | null> => {
    try {
      return await Note.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      console.error('updateNote error:', error);
      return null;
    }
  },

  // 노트 삭제
  deleteNote: async (id: string): Promise<boolean> => {
    try {
      const result = await Note.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('deleteNote error:', error);
      return false;
    }
  },

  // 검색
  searchNotes: async (query: string): Promise<INote[]> => {
    try {
      const regex = new RegExp(query, 'i');
      return await Note.find({
        $or: [
          { content: regex },
          { summary: regex },
          { tags: regex }
        ]
      }).sort({ created_at: -1 });
    } catch (error) {
      console.error('searchNotes error:', error);
      return [];
    }
  }
};

console.log('Database module initialized (MongoDB)');
