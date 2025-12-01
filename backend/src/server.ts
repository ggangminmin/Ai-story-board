import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notesRouter from './routes/notes';
import './db'; // DB 초기화

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 설정 (프로덕션 환경 대응)
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL || 'https://your-app.vercel.app',
      'https://ai-story-board-sable.vercel.app'
    ]
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없는 경우 (예: 모바일 앱, Postman) 허용
    if (!origin) return callback(null, true);

    // Vercel 프리뷰 배포 URL도 허용 (*.vercel.app)
    if (origin && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS rejected origin:', origin);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
app.use('/api/notes', notesRouter);

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MyVault AI Server is running' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`☁️ File storage: Cloudinary`);
  console.log(`🤖 OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
