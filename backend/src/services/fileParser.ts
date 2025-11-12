import fs from 'fs';
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';
import xlsx from 'xlsx';

export async function extractTextFromFile(filePath: string, mimetype: string): Promise<string> {
  try {
    const buffer = fs.readFileSync(filePath);

    // PDF 파일
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text.substring(0, 3000); // 처음 3000자만 추출
    }

    // Word 문서 (.docx)
    if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.substring(0, 3000);
    }

    // Excel 파일 (.xlsx)
    if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      let text = '';

      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const csv = xlsx.utils.sheet_to_csv(sheet);
        text += `[${sheetName}]\n${csv}\n\n`;
      });

      return text.substring(0, 3000);
    }

    // PowerPoint 파일 (.pptx)
    if (mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      // PPT는 복잡하므로 파일명과 기본 정보만 반환
      return `PowerPoint 프레젠테이션 파일입니다.`;
    }

    return '';
  } catch (error) {
    console.error('파일 텍스트 추출 오류:', error);
    return '';
  }
}

export function isDocumentFile(mimetype: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  return documentTypes.includes(mimetype);
}

export function isImageFile(mimetype: string): boolean {
  return mimetype.startsWith('image/');
}
