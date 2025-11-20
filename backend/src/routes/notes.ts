import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import { database, uploadsDir } from '../db';
import { generateSummary, generateTags, generateLinkDescription, generateFileSummary, generateEmbedding } from '../services/openai';
import { extractTextFromFile, isDocumentFile, isImageFile } from '../services/fileParser';
import { cosineSimilarity } from '../utils/similarity';
import CryptoJS from 'crypto-js';

const router = express.Router();

// MongoDB ObjectId 유효성 검사 미들웨어
const validateObjectId = (req: Request, res: Response, next: Function) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: '올바르지 않은 노트 ID입니다.' });
  }
  next();
};

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // 한글 파일명 인코딩 처리
    const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
  },
});

// 전체 노트 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const notes = await database.getAllNotes();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: '노트 조회 중 오류가 발생했습니다.' });
  }
});

// 단일 노트 조회
router.get('/:id', validateObjectId, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const note = await database.getNoteById(id);

    if (!note) {
      return res.status(404).json({ error: '노트를 찾을 수 없습니다.' });
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ error: '노트 조회 중 오류가 발생했습니다.' });
  }
});

// 노트 생성
router.post('/', upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const { content, links } = req.body;

    if (!content) {
      return res.status(400).json({ error: '내용을 입력해주세요.' });
    }

    // AI 요약, 태그 생성
    const summary = await generateSummary(content);
    const tags = await generateTags(content);

    // 업로드된 파일 정보 및 요약 생성
    const files = req.files as Express.Multer.File[];
    const fileInfos = await Promise.all(
      files.map(async (file) => {
        // 한글 파일명 디코딩
        const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const filePath = path.join(__dirname, '../../uploads', file.filename);
        let fileSummary = '';

        // 문서 파일이면 텍스트 추출 후 요약 생성
        if (isDocumentFile(file.mimetype)) {
          const extractedText = await extractTextFromFile(filePath, file.mimetype);
          fileSummary = await generateFileSummary(originalname, extractedText);
        }
        // 이미지 파일은 요약 없음
        else if (isImageFile(file.mimetype)) {
          fileSummary = '';
        }

        return {
          originalname: originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: `/uploads/${file.filename}`,
          summary: fileSummary,
        };
      })
    );

    // 검색용 텍스트 결합 (content, summary, file summaries)
    let searchableText = content;
    if (summary) searchableText += `\n${summary}`;

    // 파일 요약 추가
    fileInfos.forEach(file => {
      if (file.summary) {
        searchableText += `\n${file.summary}`;
      }
    });

    // 임베딩 생성
    const embedding = await generateEmbedding(searchableText);
    const embeddingJson = embedding.length > 0 ? JSON.stringify(embedding) : null;

    const newNote = await database.createNote({
      content,
      summary,
      tags: JSON.stringify(tags),
      links: links || null,
      files: JSON.stringify(fileInfos),
      embedding: embeddingJson,
      favorite: false
    });

    res.status(201).json(newNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '노트 생성 중 오류가 발생했습니다.' });
  }
});

// 노트 수정
router.put('/:id', validateObjectId, upload.array('files', 10), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, links, existingFiles } = req.body;

    const existingNote = await database.getNoteById(id);
    if (!existingNote) {
      return res.status(404).json({ error: '노트를 찾을 수 없습니다.' });
    }

    // AI 요약 및 태그 재생성
    const summary = content ? await generateSummary(content) : existingNote.summary;
    const tags = content ? await generateTags(content) : existingNote.tags;

    // 파일 처리
    const newFiles = req.files as Express.Multer.File[];
    const newFileInfos = newFiles.map(file => ({
      originalname: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: `/uploads/${file.filename}`,
    }));

    let allFiles = [];
    if (existingFiles) {
      try {
        allFiles = JSON.parse(existingFiles);
      } catch (e) {
        allFiles = [];
      }
    }
    allFiles = [...allFiles, ...newFileInfos];

    // 검색용 텍스트 결합 및 임베딩 생성
    const finalContent = content || existingNote.content;
    let searchableText = finalContent;
    if (summary) searchableText += `\n${summary}`;

    // 파일 요약 추가
    allFiles.forEach((file: any) => {
      if (file.summary) {
        searchableText += `\n${file.summary}`;
      }
    });

    // 임베딩 생성
    const embedding = await generateEmbedding(searchableText);
    const embeddingJson = embedding.length > 0 ? JSON.stringify(embedding) : null;

    const updatedNote = await database.updateNote(id, {
      content: finalContent,
      summary,
      tags: typeof tags === 'string' ? tags : JSON.stringify(tags),
      links: links || existingNote.links,
      files: JSON.stringify(allFiles),
      embedding: embeddingJson
    });

    res.json(updatedNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '노트 수정 중 오류가 발생했습니다.' });
  }
});

// 노트 삭제
router.delete('/:id', validateObjectId, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await database.deleteNote(id);
    if (!deleted) {
      return res.status(404).json({ error: '노트를 찾을 수 없습니다.' });
    }

    res.json({ message: '노트가 삭제되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '노트 삭제 중 오류가 발생했습니다.' });
  }
});

// 중요 표시 토글
router.patch('/:id/favorite', validateObjectId, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const note = await database.getNoteById(id);

    if (!note) {
      return res.status(404).json({ error: '노트를 찾을 수 없습니다.' });
    }

    const updatedNote = await database.updateNote(id, {
      favorite: !note.favorite
    });

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: '중요 표시 변경 중 오류가 발생했습니다.' });
  }
});

// 검색 (기존 키워드 검색)
router.get('/search/:query', async (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const notes = await database.searchNotes(query);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: '검색 중 오류가 발생했습니다.' });
  }
});

// AI 의미론적 검색
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: '검색어를 입력해주세요.' });
    }

    // 1. 검색어를 임베딩으로 변환
    const queryEmbedding = await generateEmbedding(query);

    if (queryEmbedding.length === 0) {
      return res.status(500).json({ error: '검색어 임베딩 생성에 실패했습니다.' });
    }

    // 2. 모든 노트 가져오기
    const allNotes = await database.getAllNotes();

    // 3. 각 노트와 유사도 계산
    const notesWithSimilarity = allNotes
      .map(note => {
        // 임베딩이 없는 노트는 건너뛰기
        if (!note.embedding) {
          return null;
        }

        try {
          const noteEmbedding = JSON.parse(note.embedding);
          const similarity = cosineSimilarity(queryEmbedding, noteEmbedding);

          return {
            ...note,
            similarity
          };
        } catch (error) {
          console.error(`Note ${note.id} embedding parse error:`, error);
          return null;
        }
      })
      .filter(note => note !== null) as Array<any>;

    // 4. 유사도 순으로 정렬하고 상위 5개 반환
    const topResults = notesWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)
      .map(({ similarity, ...note }) => ({
        ...note,
        similarity: similarity.toFixed(4) // 유사도 점수 포함
      }));

    res.json(topResults);
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ error: 'AI 검색 중 오류가 발생했습니다.' });
  }
});

export default router;
