import express, { Request, Response } from 'express';
import path from 'path';
import mongoose from 'mongoose';
import { database } from '../db';
import { upload, cloudinary } from '../config/cloudinary';
import { generateSummary, generateTags, generateLinkDescription, generateFileSummary, generateEmbedding } from '../services/openai';
import { extractTextFromFile, isDocumentFile, isImageFile } from '../services/fileParser';
import { cosineSimilarity } from '../utils/similarity';
import CryptoJS from 'crypto-js';
import fs from 'fs';
import axios from 'axios';

const router = express.Router();

// MongoDB ObjectId 유효성 검사 미들웨어
const validateObjectId = (req: Request, res: Response, next: Function) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: '올바르지 않은 노트 ID입니다.' });
  }
  next();
};

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
    const { content, links, fileMetadata } = req.body;

    if (!content) {
      return res.status(400).json({ error: '내용을 입력해주세요.' });
    }

    // AI 요약, 태그 생성
    const summary = await generateSummary(content);
    const tags = await generateTags(content);

    // 파일 메타데이터 파싱
    let parsedFileMetadata: Array<{title: string; description: string; fileIndex: number}> = [];
    if (fileMetadata) {
      try {
        parsedFileMetadata = JSON.parse(fileMetadata);
      } catch (e) {
        parsedFileMetadata = [];
      }
    }

    // 업로드된 파일 정보 및 요약 생성
    const files = req.files as Express.Multer.File[];
    const fileInfos = await Promise.all(
      files.map(async (file: any, index) => {
        // 한글 파일명 디코딩
        let originalname = file.originalname;
        try {
          originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        } catch (error) {
          originalname = file.originalname;
        }

        // Cloudinary URL 사용
        const cloudinaryUrl = file.path; // Cloudinary가 자동으로 생성한 URL
        let fileSummary = '';

        // 문서 파일이면 텍스트 추출 후 요약 생성
        // Cloudinary에서 파일을 다운로드해서 처리
        if (isDocumentFile(file.mimetype)) {
          try {
            // Cloudinary URL에서 파일 다운로드
            const response = await axios.get(cloudinaryUrl, { responseType: 'arraybuffer' });
            const tempFilePath = path.join('/tmp', `temp-${Date.now()}-${originalname}`);
            fs.writeFileSync(tempFilePath, response.data);

            const extractedText = await extractTextFromFile(tempFilePath, file.mimetype);
            fileSummary = await generateFileSummary(originalname, extractedText);

            // 임시 파일 삭제
            fs.unlinkSync(tempFilePath);
          } catch (error) {
            console.error('File summary generation error:', error);
            fileSummary = '';
          }
        }
        // 이미지 파일은 요약 없음
        else if (isImageFile(file.mimetype)) {
          fileSummary = '';
        }

        // 파일 메타데이터 찾기
        const metadata = parsedFileMetadata.find(m => m.fileIndex === index);

        return {
          title: metadata?.title || '',
          originalname: originalname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          path: cloudinaryUrl, // Cloudinary URL 저장
          cloudinaryId: file.filename, // Cloudinary public_id 저장 (삭제 시 필요)
          description: metadata?.description || '',
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
    const newFileInfos = newFiles.map((file: any) => {
      // 한글 파일명 디코딩
      let originalname = file.originalname;
      try {
        originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
      } catch (error) {
        originalname = file.originalname;
      }
      return {
        originalname: originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path, // Cloudinary URL
        cloudinaryId: file.filename,
      };
    });

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

// 파일 다운로드 프록시 (Cloudinary Cross-origin 문제 해결)
router.get('/download/:noteId/:fileIndex', validateObjectId, async (req: Request, res: Response) => {
  try {
    const { noteId, fileIndex } = req.params;
    const note = await database.getNoteById(noteId);

    if (!note) {
      return res.status(404).json({ error: '노트를 찾을 수 없습니다.' });
    }

    const files = note.files ? JSON.parse(note.files) : [];
    const fileIndexNum = parseInt(fileIndex);

    if (fileIndexNum < 0 || fileIndexNum >= files.length) {
      return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
    }

    const file = files[fileIndexNum];

    // Cloudinary URL에서 파일 다운로드
    const response = await axios.get(file.path, { responseType: 'arraybuffer' });

    // Content-Disposition 헤더 설정 (파일 다운로드 강제)
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalname)}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.send(response.data);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: '파일 다운로드 중 오류가 발생했습니다.' });
  }
});

export default router;
