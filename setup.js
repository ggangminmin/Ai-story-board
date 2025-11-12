const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('=================================');
  console.log('MyVault AI 설치를 시작합니다...');
  console.log('=================================\n');

  // 1. 백엔드 패키지 설치
  console.log('[1/4] 백엔드 패키지 설치 중...');
  try {
    execSync('cd backend && npm install', { stdio: 'inherit' });
    console.log('✓ 백엔드 패키지 설치 완료\n');
  } catch (error) {
    console.error('✗ 백엔드 패키지 설치 실패:', error.message);
    process.exit(1);
  }

  // 2. 프론트엔드 패키지 설치
  console.log('[2/4] 프론트엔드 패키지 설치 중...');
  try {
    execSync('cd frontend && npm install', { stdio: 'inherit' });
    console.log('✓ 프론트엔드 패키지 설치 완료\n');
  } catch (error) {
    console.error('✗ 프론트엔드 패키지 설치 실패:', error.message);
    process.exit(1);
  }

  // 3. .env 파일 생성
  console.log('[3/4] 환경 변수 설정...');
  const envPath = path.join(__dirname, 'backend', '.env');

  if (fs.existsSync(envPath)) {
    console.log('.env 파일이 이미 존재합니다.\n');
  } else {
    console.log('\nOpenAI API Key를 입력해주세요.');
    console.log('(https://platform.openai.com/api-keys 에서 발급받을 수 있습니다)');

    const apiKey = await question('OpenAI API Key: ');

    const envContent = `PORT=3001
OPENAI_API_KEY=${apiKey}
ENCRYPTION_KEY=myvault-ai-secret-key-change-this-in-production
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✓ .env 파일 생성 완료\n');
  }

  // 4. uploads 폴더 생성
  console.log('[4/4] 업로드 폴더 생성...');
  const uploadsDir = path.join(__dirname, 'backend', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  console.log('✓ 업로드 폴더 생성 완료\n');

  console.log('=================================');
  console.log('설치가 완료되었습니다!');
  console.log('=================================\n');
  console.log('실행 방법:');
  console.log('  npm start');
  console.log('\n그러면 브라우저에서 http://localhost:3000 으로 접속하세요.\n');

  rl.close();
}

setup().catch(error => {
  console.error('설치 중 오류 발생:', error);
  rl.close();
  process.exit(1);
});
