import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { Note, FileInfo } from '../types';

function EditNotePage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [existingFiles, setExistingFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(true);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await apiClient.get<Note>(`/api/notes/${id}`);
      const note = response.data;

      setContent(note.content);
      setLink(note.link || '');

      if (note.files) {
        try {
          const parsedFiles = JSON.parse(note.files);
          setExistingFiles(parsedFiles);
        } catch (e) {
          setExistingFiles([]);
        }
      }
    } catch (error) {
      console.error('노트 조회 실패:', error);
      alert('노트를 불러오는데 실패했습니다.');
      navigate('/');
    } finally {
      setNoteLoading(false);
    }
  };

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
      formData.append('existingFiles', JSON.stringify(existingFiles));

      if (files) {
        Array.from(files).forEach((file) => {
          formData.append('files', file);
        });
      }

      await apiClient.put(`/api/notes/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('메모가 수정되었습니다!');
      navigate(`/view/${id}`);
    } catch (error) {
      console.error('수정 실패:', error);
      alert('메모 수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const removeExistingFile = (index: number) => {
    setExistingFiles(existingFiles.filter((_, i) => i !== index));
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype === 'application/pdf') return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📽️';
    return '📎';
  };

  if (noteLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500 dark:text-gray-400 text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">메모 수정</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="메모 내용을 입력하세요..."
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            AI가 자동으로 요약과 태그를 다시 생성합니다.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            링크 (선택사항)
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* 기존 파일 목록 */}
        {existingFiles.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              기존 첨부 파일
            </label>
            <div className="space-y-2">
              {existingFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getFileIcon(file.mimetype)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {file.originalname}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingFile(idx)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 새 파일 추가 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            파일 추가 (선택사항)
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            PDF, Word, Excel, PPT, 이미지 파일 등 (최대 50MB)
          </p>
          {files && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                새로 추가할 파일 ({files.length}개):
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 ml-4 list-disc">
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
            {loading ? '수정 중...' : '수정하기'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/view/${id}`)}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditNotePage;
