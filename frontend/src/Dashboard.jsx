import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  LogOut,
  MessageCircle,
  MoonStar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authClient, forumClient } from './api';

const REACTION_TYPES = ['LIKE', 'BULLISH', 'BEARISH', 'WOW', 'INSIGHTFUL'];

const parseErrorMessage = (error, fallback) => {
  return error?.response?.data?.message || error?.message || fallback;
};

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newComment, setNewComment] = useState('');

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await authClient.profile();
      return response.data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await forumClient.getCategories();
      return response.data || [];
    },
  });

  const threadsQuery = useQuery({
    queryKey: ['threads', selectedCategoryId],
    enabled: Boolean(selectedCategoryId),
    queryFn: async () => {
      const response = await forumClient.getThreadsByCategory(selectedCategoryId);
      return response.data || [];
    },
  });

  const postsQueryKey = ['posts', selectedThreadId];
  const postsQuery = useQuery({
    queryKey: postsQueryKey,
    enabled: Boolean(selectedThreadId),
    queryFn: async () => {
      const response = await forumClient.getPostsByThread(selectedThreadId);
      return response.data || [];
    },
  });

  useEffect(() => {
    if (profileQuery.isError) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.error('Phiên đăng nhập đã hết hạn.');
      navigate('/login');
    }
  }, [navigate, profileQuery.isError]);

  useEffect(() => {
    const categories = categoriesQuery.data || [];
    if (!categories.length) {
      setSelectedCategoryId(null);
      setSelectedThreadId(null);
      return;
    }

    if (!selectedCategoryId || !categories.some((item) => item.id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0].id);
      setSelectedThreadId(null);
    }
  }, [categoriesQuery.data, selectedCategoryId]);

  useEffect(() => {
    const threads = threadsQuery.data || [];
    if (!threads.length) {
      setSelectedThreadId(null);
      return;
    }

    if (!selectedThreadId || !threads.some((item) => item.id === selectedThreadId)) {
      setSelectedThreadId(threads[0].id);
    }
  }, [threadsQuery.data, selectedThreadId]);

  const createCategoryMutation = useMutation({
    mutationFn: (payload) => forumClient.createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã tạo category mới');
      setNewCategory({ name: '', description: '' });
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không tạo được category'));
    },
  });

  const createThreadMutation = useMutation({
    mutationFn: (payload) => forumClient.createThread(selectedCategoryId, payload),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['threads', selectedCategoryId] });
      setSelectedThreadId(response?.data?.id || null);
      setNewThreadTitle('');
      toast.success('Topic đã được tạo');
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không tạo được thread'));
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: (payload) => forumClient.createPost(selectedThreadId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsQueryKey });
      setNewComment('');
      toast.success('Đã gửi bình luận');
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không gửi được bình luận'));
    },
  });

  const increaseViewMutation = useMutation({
    mutationFn: (threadId) => forumClient.increaseThreadView(threadId),
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['threads', selectedCategoryId] });
    },
  });

  const reactMutation = useMutation({
    mutationFn: ({ postId, type }) => forumClient.createOrUpdateReaction(postId, { type, userName: forumUserName }),
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: postsQueryKey });
      const previousPosts = queryClient.getQueryData(postsQueryKey);

      queryClient.setQueryData(postsQueryKey, (oldPosts = []) => {
        return oldPosts.map((post) => {
          if (post.id !== postId) {
            return post;
          }

          const reactions = Array.isArray(post.reactions) ? [...post.reactions] : [];
          const existingIndex = reactions.findIndex((item) => item.userName === forumUserName);
          if (existingIndex >= 0) {
            reactions[existingIndex] = { ...reactions[existingIndex], type };
          } else {
            reactions.push({ id: `optimistic-${Date.now()}`, userName: forumUserName, type });
          }

          return { ...post, reactions };
        });
      });

      return { previousPosts };
    },
    onError: (error, _variables, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(postsQueryKey, context.previousPosts);
      }
      toast.error(parseErrorMessage(error, 'Không gửi được reaction'));
    },
    onSuccess: () => {
      toast.success('Reaction đã cập nhật');
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: postsQueryKey });
    },
  });

  const handleLogout = async () => {
    try {
      await authClient.logout();
    } catch (_error) {
      // Keep UX smooth even if backend logout fails.
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  const groupedReaction = (post) => {
    const source = post?.reactions || [];
    return source.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
  };

  const categories = categoriesQuery.data || [];
  const threads = threadsQuery.data || [];
  const posts = postsQuery.data || [];
  const selectedCategory = categories.find((item) => item.id === selectedCategoryId);
  const selectedThread = threads.find((item) => item.id === selectedThreadId);
  const forumUserName = profileQuery.data?.username || '';

  const loadingInitial = profileQuery.isLoading || categoriesQuery.isLoading;

  if (loadingInitial) {
    return (
      <div className="loading-screen">
        <div className="skeleton skeleton-banner"></div>
        <div className="skeleton-grid">
          <div className="skeleton skeleton-col"></div>
          <div className="skeleton skeleton-col"></div>
          <div className="skeleton skeleton-col"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-shell">
      <motion.header className="topbar" initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div>
          <button className="topbar-brand" type="button" onClick={() => navigate('/forum/categories')}>
            <h1>Stock Forum v1.01</h1>
          </button>
          <p>{profileQuery.data?.username} • Forum member</p>
        </div>

        <div className="topbar-right">
          <div className="metric-chip"><TrendingUp size={14} /> {threads.length} topics</div>
          <div className="metric-chip"><MessageCircle size={14} /> {posts.length} comments</div>
          <button className="ghost-btn" onClick={handleLogout}><LogOut size={15} /> Đăng xuất</button>
        </div>
      </motion.header>

      <div className="forum-grid">
        <section className="panel">
          <div className="panel-head"><BarChart3 size={16} /><h2>Stock Categories</h2></div>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              createCategoryMutation.mutate({
                name: newCategory.name.trim(),
                description: newCategory.description.trim(),
              });
            }}
          >
            <input placeholder="Ticker: FPT, VNM..." value={newCategory.name} onChange={(e) => setNewCategory((old) => ({ ...old, name: e.target.value }))} required />
            <input placeholder="Mô tả" value={newCategory.description} onChange={(e) => setNewCategory((old) => ({ ...old, description: e.target.value }))} />
            <button type="submit" className="primary-btn" disabled={createCategoryMutation.isPending}>Tạo category</button>
          </form>

          {categoriesQuery.isError && <p className="empty-state">Không tải được category.</p>}
          {!categories.length && !categoriesQuery.isError && (
            <div className="empty-state-card">
              <MoonStar size={16} />
              <p>Chưa có category. Tạo mã đầu tiên để mở forum.</p>
            </div>
          )}

          <ul className="list">
            {categories.map((category) => (
              <li key={category.id}>
                <motion.button whileTap={{ scale: 0.98 }} className={`list-item ${selectedCategoryId === category.id ? 'active' : ''}`} onClick={() => { setSelectedCategoryId(category.id); setSelectedThreadId(null); }}>
                  <div className="list-title">{category.name}</div>
                  <div className="list-subtitle">{category.description || 'No description'}</div>
                </motion.button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panel-head"><Sparkles size={16} /><h2>Threads {selectedCategory ? `• ${selectedCategory.name}` : ''}</h2></div>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              createThreadMutation.mutate({ title: newThreadTitle.trim(), userName: forumUserName });
            }}
          >
            <input placeholder="Tiêu đề topic" value={newThreadTitle} onChange={(e) => setNewThreadTitle(e.target.value)} required />
            <button type="submit" className="primary-btn" disabled={!selectedCategoryId || !forumUserName || createThreadMutation.isPending}>Tạo thread</button>
          </form>

          {threadsQuery.isLoading && <div className="skeleton skeleton-list"></div>}
          {!threadsQuery.isLoading && !threads.length && selectedCategoryId && <p className="empty-state">Category này chưa có topic.</p>}

          <ul className="list">
            {threads.map((thread) => (
              <li key={thread.id}>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.985 }}
                  className={`list-item ${selectedThreadId === thread.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedThreadId(thread.id);
                    increaseViewMutation.mutate(thread.id);
                  }}
                >
                  <div className="list-title">{thread.title}</div>
                  <div className="list-subtitle">
                    by {thread.userName || 'unknown'} • {thread.viewCount} views • {new Date(thread.createdAt).toLocaleString()}
                  </div>
                </motion.button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel panel-wide">
          <div className="panel-head"><MessageCircle size={16} /><h2>Comments {selectedThread ? `• ${selectedThread.title}` : ''}</h2></div>
          <form
            className="stack-form"
            onSubmit={(e) => {
              e.preventDefault();
              createCommentMutation.mutate({ content: newComment.trim(), userName: forumUserName });
            }}
          >
            <textarea rows={4} placeholder="Để lại luận điểm, tín hiệu kỹ thuật, quản trị rủi ro..." value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
            <button type="submit" className="primary-btn" disabled={!selectedThreadId || !forumUserName || createCommentMutation.isPending}>Gửi comment</button>
          </form>

          {postsQuery.isLoading && <div className="skeleton skeleton-list"></div>}

          {!postsQuery.isLoading && !posts.length && selectedThreadId && (
            <div className="empty-state-card">
              <MessageCircle size={16} />
              <p>Chưa có comment nào. Bạn có thể mở đầu cuộc thảo luận.</p>
            </div>
          )}

          {!selectedThreadId && <p className="empty-state">Chọn thread để xem và phản hồi bình luận.</p>}

          <div className="comments-box">
            <AnimatePresence>
              {posts.map((post) => {
                const summary = groupedReaction(post);
                return (
                  <motion.article
                    key={post.id}
                    className="comment-card"
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p>{post.content}</p>
                    <div className="meta-line">{post.userName || 'unknown'} • {new Date(post.createdAt).toLocaleString()}</div>
                    <div className="reaction-row">
                      {REACTION_TYPES.map((type) => {
                        const isOwnPost = post.userName === forumUserName;
                        return (
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            key={`${post.id}-${type}`}
                            className="tag-btn"
                            disabled={isOwnPost}
                            title={isOwnPost ? "Bạn không thể react bài của chính mình" : type}
                            onClick={() => {
                              if (!isOwnPost) {
                                reactMutation.mutate({ postId: post.id, type });
                              }
                            }}
                            style={{
                              opacity: isOwnPost ? 0.5 : 1,
                              cursor: isOwnPost ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {type} {summary[type] ? `(${summary[type]})` : ''}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
