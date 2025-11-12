import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';

function NewNotePage() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (link) formData.append('link', link);

      if (files) {
        Array.from(files).forEach((file) => {
          formData.append('files', file);
        });
      }

      await apiClient.post('/api/notes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('메모가 저장되었습니다!');
      navigate('/');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('메모 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">새 메모 작성</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="메모 내용을 입력하세요..."
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            AI가 자동으로 요약과 태그를 생성합니다.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            링크 (선택사항)
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            파일 첨부 (선택사항)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
          />
          <p className="text-sm text-gray-500 mt-1">
            PDF, Word, Excel, PPT, 이미지 파일 등 (최대 50MB)
          </p>
          {files && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">
                선택된 파일 ({files.length}개):
              </p>
              <ul className="text-sm text-gray-600 ml-4 list-disc">
                {Array.from(files).map((file, idx) => (
                  <li key={idx}>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? '저장 중...' : '저장하기'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewNotePage;
