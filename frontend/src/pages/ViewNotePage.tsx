import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import apiClient from '../api/client';
import { Note, FileInfo, Link } from '../types';

function ViewNotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    try {
      const response = await apiClient.get(`/api/notes/${id}`);
      setNote(response.data);
    } catch (error) {
      console.error('노트 조회 실패:', error);
      alert('노트를 불러오는데 실패했습니다.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await apiClient.delete(`/api/notes/${id}`);
      alert('삭제되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const toggleFavorite = async () => {
    try {
      await apiClient.patch(`/api/notes/${id}/favorite`);
      fetchNote();
    } catch (error) {
      console.error('중요 표시 실패:', error);
      alert('중요 표시에 실패했습니다.');
    }
  };

  const parseFiles = (filesJson: string | null): FileInfo[] => {
    if (!filesJson) return [];
    try {
      return JSON.parse(filesJson);
    } catch {
      return [];
    }
  };

  const parseTags = (tagsJson: string | null): string[] => {
    if (!tagsJson) return [];
    try {
      return JSON.parse(tagsJson);
    } catch {
      return [];
    }
  };

  const parseLinks = (linksJson: string | null): Link[] => {
    if (!linksJson) return [];
    try {
      return JSON.parse(linksJson);
    } catch {
      return [];
    }
  };

  const isImageFile = (mimetype: string) => {
    return mimetype.startsWith('image/');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">노트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const files = parseFiles(note.files);
  const tags = parseTags(note.tags);
  const links = parseLinks(note.links);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <RouterLink to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </RouterLink>
        <div className="flex gap-2">
          <button
            onClick={toggleFavorite}
            className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition flex items-center gap-1 border border-yellow-300 dark:border-yellow-700"
          >
            <span className="text-lg">{note.favorite ? '⭐' : '☆'}</span>
            {note.favorite ? '중요 해제' : '중요 표시'}
          </button>
          <button
            onClick={() => navigate(`/edit/${id}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            수정
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            삭제
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">메모 내용</h1>
          <div className="prose max-w-none">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
          </div>
        </div>

        {note.summary && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              AI 요약
            </h2>
            <p className="text-gray-700 dark:text-gray-300">{note.summary}</p>
          </div>
        )}

        {tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">태그</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {links.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">링크 ({links.length}개)</h2>
            <div className="space-y-4">
              {links.map((link, idx) => (
                <div key={idx} className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                  {link.title && (
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{link.title}</h3>
                  )}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 break-all block mb-2"
                  >
                    {link.url}
                  </a>
                  {link.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm italic">
                      💡 {link.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              첨부 파일 ({files.length}개)
            </h2>
            <div className="grid gap-4">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800/50"
                >
                  {file.title && (
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{file.title}</h3>
                  )}

                  {isImageFile(file.mimetype) ? (
                    <div>
                      <img
                        src={file.path}
                        alt={file.originalname}
                        className="max-w-full h-auto rounded mb-2"
                        style={{ maxHeight: '400px' }}
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{file.originalname}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {file.originalname}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                        <a
                          href={file.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                        >
                          다운로드
                        </a>
                      </div>
                      {file.summary && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border-l-4 border-blue-500 dark:border-blue-400">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            📄 {file.summary}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {file.description && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm italic mt-2">💡 {file.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          <p>작성일: {new Date(note.created_at).toLocaleString('ko-KR')}</p>
          <p>수정일: {new Date(note.updated_at).toLocaleString('ko-KR')}</p>
        </div>
      </div>
    </div>
  );
}

export default ViewNotePage;
