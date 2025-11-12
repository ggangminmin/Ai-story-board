import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Note, FileInfo } from '../types';

type SortOption = 'latest' | 'favorite';

function NotesListPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    // 모든 태그 추출
    const tags = new Set<string>();
    notes.forEach(note => {
      const noteTags = parseTags(note.tags);
      noteTags.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags));
  }, [notes]);

  const fetchNotes = async () => {
    try {
      const response = await apiClient.get('/api/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('노트 조회 실패:', error);
      // 에러 발생 시 빈 배열로 설정 (초기 상태)
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchNotes();
      return;
    }

    try {
      setIsSearching(true);
      const response = await apiClient.post('/api/notes/search', {
        query: searchQuery
      });
      setNotes(response.data);
    } catch (error) {
      console.error('검색 실패:', error);
      alert('검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await apiClient.delete(`/api/notes/${id}`);
      fetchNotes();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const toggleFavorite = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await apiClient.patch(`/api/notes/${id}/favorite`);
      fetchNotes();
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

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype === 'application/pdf') return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('sheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📽️';
    return '📎';
  };

  const renderFilePreview = (file: FileInfo) => {
    if (file.mimetype.startsWith('image/')) {
      return (
        <img
          src={`http://localhost:3001${file.path}`}
          alt={file.originalname}
          className="w-12 h-12 object-cover rounded"
        />
      );
    }
    return (
      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-2xl">
        {getFileIcon(file.mimetype)}
      </div>
    );
  };

  const getFilteredAndSortedNotes = () => {
    let filtered = [...notes];

    // 태그 필터링
    if (selectedTag) {
      filtered = filtered.filter(note => {
        const tags = parseTags(note.tags);
        return tags.includes(selectedTag);
      });
    }

    // 정렬
    if (sortBy === 'latest') {
      filtered.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortBy === 'favorite') {
      filtered.sort((a, b) => {
        if (a.favorite === b.favorite) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return a.favorite ? -1 : 1;
      });
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500 dark:text-gray-400 text-lg">로딩 중...</div>
      </div>
    );
  }

  const displayNotes = getFilteredAndSortedNotes();

  return (
    <div className="min-h-screen pb-24">
      {/* 검색창 */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-6 pt-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="AI 검색으로 메모 찾기..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm transition-all"
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
          {searchQuery && !isSearching && (
            <button
              onClick={() => {
                setSearchQuery('');
                fetchNotes();
              }}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 의미론적 검색 활성화
          </div>
        )}

        {/* 정렬 및 필터 */}
        <div className="mt-4 flex flex-wrap gap-3 items-center">
          {/* 정렬 옵션 */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'latest'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy('favorite')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'favorite'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              ⭐ 중요순
            </button>
          </div>

          {/* 태그 필터 */}
          {allTags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedTag === null
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                전체
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedTag === tag
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 카드형 메모 리스트 */}
      {displayNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-500 dark:text-gray-400 text-xl mb-6">
            {searchQuery || selectedTag ? '검색 결과가 없습니다.' : '아직 메모가 없습니다.'}
          </p>
          {!searchQuery && !selectedTag && (
            <button
              onClick={() => navigate('/new')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              첫 메모 작성하기
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayNotes.map((note) => {
            const files = parseFiles(note.files);
            const tags = parseTags(note.tags);

            return (
              <Link
                key={note.id}
                to={`/view/${note.id}`}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transform hover:-translate-y-1 relative"
              >
                {/* 중요 표시 별 */}
                <button
                  onClick={(e) => toggleFavorite(note.id, e)}
                  className="absolute top-4 right-4 z-10 text-2xl hover:scale-125 transition-transform"
                >
                  {note.favorite ? '⭐' : '☆'}
                </button>

                <div className="p-6">
                  {/* 내용 */}
                  <div className="mb-4 pr-8">
                    <p className="text-gray-900 dark:text-gray-100 line-clamp-3 text-base leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  {/* 요약 */}
                  {note.summary && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        💡 {note.summary}
                      </p>
                    </div>
                  )}

                  {/* 태그 */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-800 dark:text-blue-300 text-xs px-3 py-1 rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {tags.length > 3 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                          +{tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 첨부파일 미리보기 */}
                  {files.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {files.length}개 파일
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {files.slice(0, 4).map((file, idx) => (
                          <div key={idx} className="flex-shrink-0">
                            {renderFilePreview(file)}
                          </div>
                        ))}
                        {files.length > 4 && (
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-400 font-medium">
                            +{files.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 링크 */}
                  {note.link && (
                    <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <a
                          href={note.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-600 dark:text-blue-400 truncate hover:underline"
                        >
                          {note.link}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* 하단 메타 정보 */}
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(note.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/edit/${note.id}`);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                    >
                      수정
                    </button>
                    <button
                      onClick={(e) => handleDelete(note.id, e)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* 하단 우측 플로팅 버튼 */}
      <button
        onClick={() => navigate('/new')}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-110 group z-50"
        aria-label="새 메모 작성"
      >
        <svg className="h-8 w-8 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

export default NotesListPage;
