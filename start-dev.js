const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('=================================');
console.log('MyVault AI 시작 중...');
console.log('=================================\n');

// .env 파일 확인
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env 파일이 없습니다!');
  console.error('먼저 "npm run setup" 명령어를 실행해주세요.\n');
  process.exit(1);
}

// node_modules 확인
const backendModules = path.join(__dirname, 'backend', 'node_modules');
const frontendModules = path.join(__dirname, 'frontend', 'node_modules');

if (!fs.existsSync(backendModules) || !fs.existsSync(frontendModules)) {
  console.error('❌ 패키지가 설치되지 않았습니다!');
  console.error('먼저 "npm run setup" 명령어를 실행해주세요.\n');
  process.exit(1);
}

console.log('✓ 백엔드 서버 시작 중... (http://localhost:3001)');
console.log('✓ 프론트엔드 서버 시작 중... (http://localhost:3000)\n');

// Windows에서는 cmd를 사용
const isWindows = process.platform === 'win32';

// 백엔드 실행
const backend = spawn(
  isWindows ? 'cmd' : 'npm',
  isWindows ? ['/c', 'npm', 'run', 'dev'] : ['run', 'dev'],
  {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: isWindows
  }
);

// 프론트엔드 실행 (2초 후)
setTimeout(() => {
  const frontend = spawn(
    isWindows ? 'cmd' : 'npm',
    isWindows ? ['/c', 'npm', 'run', 'dev'] : ['run', 'dev'],
    {
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit',
      shell: isWindows
    }
  );

  frontend.on('error', (error) => {
    console.error('프론트엔드 실행 오류:', error);
  });

  // 종료 처리
  process.on('SIGINT', () => {
    console.log('\n서버를 종료합니다...');
    backend.kill();
    frontend.kill();
    process.exit();
  });
}, 2000);

backend.on('error', (error) => {
  console.error('백엔드 실행 오류:', error);
});

console.log('\n브라우저에서 http://localhost:3000 으로 접속하세요!');
console.log('종료하려면 Ctrl+C를 누르세요.\n');
