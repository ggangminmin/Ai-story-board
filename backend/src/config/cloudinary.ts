import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Cloudinary 설정
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary Storage 설정
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 한글 파일명 처리
    let originalname = file.originalname;
    try {
      originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (error) {
      originalname = file.originalname;
    }

    // 파일 확장자 추출
    const ext = originalname.split('.').pop();
    const nameWithoutExt = originalname.substring(0, originalname.lastIndexOf('.'));

    return {
      folder: 'myvault-uploads',
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}-${nameWithoutExt}`,
      resource_type: 'auto' as const, // 자동으로 이미지/비디오/원본 파일 감지
      format: ext, // 원본 확장자 유지
      access_mode: 'public' as const, // 공개 접근 허용
    };
  },
});

// Multer 설정
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/haansoftdocx', // Hancom Office Word format
      'application/haansoftxls', // Hancom Office Excel format
      'application/haansoftppt', // Hancom Office PowerPoint format
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    console.log(`File upload attempt: ${file.originalname}, mimetype: ${file.mimetype}`);

    if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      console.error(`Rejected file type: ${file.mimetype} for file: ${file.originalname}`);
      cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
  },
});

export { cloudinary, upload };
