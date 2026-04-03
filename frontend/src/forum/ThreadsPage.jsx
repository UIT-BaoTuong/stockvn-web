import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Flame, Sparkles, Trash2 } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { forumClient } from '../api';
import ForumLayout from './ForumLayout';

const parseErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;
const hotScore = (thread) => (thread?.viewCount || 0) * 2;

function ThreadsPage() {
  const { categoryId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [deleteConfirmThreadId, setDeleteConfirmThreadId] = useState(null);

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await forumClient.getCategories();
      return response.data || [];
    },
  });

  const threadsQuery = useQuery({
    queryKey: ['threads', categoryId],
    enabled: Boolean(categoryId),
    queryFn: async () => {
      const response = await forumClient.getThreadsByCategory(categoryId);
      return response.data || [];
    },
  });

  const createThreadMutation = useMutation({
    mutationFn: ({ title, userName }) => forumClient.createThread(categoryId, { title, userName }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['threads', categoryId] });
      setNewThreadTitle('');
      toast.success('Topic đã được tạo');
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không tạo được thread'));
    },
  });

  const increaseViewMutation = useMutation({
    mutationFn: (threadId) => forumClient.increaseThreadView(threadId),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['threads', categoryId] });
    },
  });

  const deleteThreadMutation = useMutation({
    mutationFn: (threadId) => forumClient.deleteThread(threadId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['threads', categoryId] });
      setDeleteConfirmThreadId(null);
      toast.success('Đã xóa thread');
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không xóa được thread'));
    },
  });

  const selectedCategory = (categoriesQuery.data || []).find((item) => String(item.id) === String(categoryId));
  const isAllCategory = selectedCategory?.name?.toUpperCase() === 'ALL';
  const threads = threadsQuery.data || [];

  const hotThreadIds = useMemo(() => {
    const sortedByHot = [...threads].sort((a, b) => hotScore(b) - hotScore(a));
    return new Set(
      sortedByHot
        .filter((thread) => hotScore(thread) > 0)
        .slice(0, 10)
        .map((thread) => thread.id),
    );
  }, [threads]);

  const sortedThreads = useMemo(
    () => [...threads].sort((a, b) => {
      const aHot = hotThreadIds.has(a.id) ? 1 : 0;
      const bHot = hotThreadIds.has(b.id) ? 1 : 0;
      if (aHot !== bHot) {
        return bHot - aHot;
      }
      const scoreDiff = hotScore(b) - hotScore(a);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }),
    [threads, hotThreadIds],
  );

  return (
    <ForumLayout rightStats={{ left: threads.length, right: 0 }}>
      {(forumUserName) => (
        <section className="panel page-panel">
          <div className="page-toolbar">
            <button className="ghost-btn" onClick={() => navigate('/forum/categories')}><ArrowLeft size={14} /> Categories</button>
          </div>

          <div className="panel-head"><Sparkles size={16} /><h2>Threads {selectedCategory ? `• ${selectedCategory.name}` : ''}</h2></div>

          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (isAllCategory) {
                toast.error('Không thể tạo thread trực tiếp trong category ALL');
                return;
              }
              createThreadMutation.mutate({ title: newThreadTitle.trim(), userName: forumUserName });
            }}
          >
            <input
              placeholder={isAllCategory ? 'ALL tổng hợp mọi thread, hãy chọn category cụ thể để tạo mới' : 'Tiêu đề topic'}
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              required
              disabled={isAllCategory}
            />
            <button type="submit" className="primary-btn" disabled={!forumUserName || createThreadMutation.isPending || isAllCategory}>Tạo thread</button>
          </form>

          {threadsQuery.isError && <p className="empty-state">Không tải được threads.</p>}
          {!threadsQuery.isLoading && !threads.length && <p className="empty-state">{isAllCategory ? 'Chưa có topic nào trong toàn bộ forum.' : 'Category này chưa có topic.'}</p>}

          <ul className="list">
            {sortedThreads.map((thread) => (
              <li key={thread.id} className="list-item-wrapper">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  className="list-item"
                  onClick={() => {
                    increaseViewMutation.mutate(thread.id);
                    navigate(`/forum/categories/${categoryId}/threads/${thread.id}`);
                  }}
                >
                  <div className="list-title-row">
                    {hotThreadIds.has(thread.id) && (
                      <div style={{ width: '18px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: '4px' }}>
                        <motion.div
                          animate={{ scale: [1, 1.1, 0.95, 1.05, 1], rotate: [0, -5, 5, -3, 0] }}
                          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
                        >
                          <Flame size={14} style={{ color: '#e65100' }} />
                        </motion.div>
                      </div>
                    )}
                    <span className="list-title">{thread.title}</span>
                  </div>
                  <div className="list-subtitle">by {thread.userName || 'unknown'} • {thread.viewCount} views • {new Date(thread.createdAt).toLocaleString()}</div>
                </motion.button>
                {thread.userName === forumUserName && (
                  <button
                    type="button"
                    className="icon-btn-small-delete"
                    title="Xóa thread"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmThreadId(thread.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>

          <AnimatePresence>
            {deleteConfirmThreadId && (
              <div className="modal-overlay" onClick={() => setDeleteConfirmThreadId(null)}>
                <motion.div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <h3>Xác nhận xóa thread</h3>
                  <p>Bạn có chắc chắn muốn xóa thread này không? Tất cả comment sẽ bị xóa theo. Hành động này không thể hoàn tác.</p>
                  <div className="modal-actions">
                    <button type="button" className="ghost-btn" onClick={() => setDeleteConfirmThreadId(null)}>Hủy</button>
                    <button
                      type="button"
                      className="danger-btn"
                      disabled={deleteThreadMutation.isPending}
                      onClick={() => deleteThreadMutation.mutate(deleteConfirmThreadId)}
                    >
                      {deleteThreadMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </section>
      )}
    </ForumLayout>
  );
}

export default ThreadsPage;
