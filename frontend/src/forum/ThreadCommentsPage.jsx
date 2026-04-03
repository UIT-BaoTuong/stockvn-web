import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Edit, Laugh, MessageCircle, Trash2, ThumbsUp } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { forumClient } from '../api';
import ForumLayout from './ForumLayout';

const REACTION_TYPES = ['GIỎI', 'NGU', 'HAHA'];
const REACTION_ICONS = {
  'GIỎI': ThumbsUp,
  'NGU': AlertCircle,
  'HAHA': Laugh,
};
const parseErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;
const REPLY_META_REGEX = /^\[reply-to:(\d+)\]\n\[quote-user:([^\]]+)\]\n\[quote-text:([^\]]+)\]\n\n([\s\S]*)$/;

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch (_error) {
    return value;
  }
};

const parseReplyPayload = (rawContent) => {
  const content = rawContent || '';
  const match = content.match(REPLY_META_REGEX);

  if (!match) {
    return {
      body: content,
      replyToId: null,
      quoteUser: null,
      quoteText: null,
    };
  }

  return {
    body: match[4]?.trim() || '',
    replyToId: Number(match[1]),
    quoteUser: safeDecode(match[2]),
    quoteText: safeDecode(match[3]),
  };
};

const buildReplyPayload = ({ postId, userName, quoteText }, body) => {
  return [
    `[reply-to:${postId}]`,
    `[quote-user:${encodeURIComponent(userName || 'unknown')}]`,
    `[quote-text:${encodeURIComponent(quoteText || '')}]`,
    '',
    body,
  ].join('\n');
};

function ThreadCommentsPage() {
  const { categoryId, threadId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState(null);
  const composerRef = useRef(null);
  const postRefsMap = useRef(new Map());

  // Manage body scroll when modal is open
  useEffect(() => {
    if (editingPost || deleteConfirmPostId) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [editingPost, deleteConfirmPostId]);

  const postsQueryKey = ['posts', threadId];
  const postsQuery = useQuery({
    queryKey: postsQueryKey,
    enabled: Boolean(threadId),
    queryFn: async () => {
      const response = await forumClient.getPostsByThread(threadId);
      return response.data || [];
    },
  });

  const threadQuery = useQuery({
    queryKey: ['thread', threadId],
    enabled: Boolean(threadId),
    queryFn: async () => {
      const response = await forumClient.getThreadsByCategory(categoryId);
      const threads = response.data || [];
      return threads.find((item) => String(item.id) === String(threadId)) || null;
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: ({ content, userName }) => forumClient.createPost(threadId, { content, userName }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsQueryKey });
      setNewComment('');
      setReplyTarget(null);
      toast.success('Đã gửi bình luận');
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không gửi được bình luận'));
    },
  });

  const reactMutation = useMutation({
    mutationFn: ({ postId, type, userName }) => forumClient.createOrUpdateReaction(postId, { type, userName }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsQueryKey });
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không gửi được reaction'));
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ postId, content }) => forumClient.updatePost(postId, { content }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsQueryKey });
      setEditingPost(null);
      toast.success('Đã cập nhật bình luận');
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không cập nhật được bình luận'));
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (postId) => forumClient.deletePost(postId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: postsQueryKey });
      setDeleteConfirmPostId(null);
      toast.success('Đã xóa bình luận');
    },
    onError: (error) => {
      toast.error(parseErrorMessage(error, 'Không xóa được bình luận'));
    },
  });

  const groupedReaction = (post) => {
    const source = post?.reactions || [];
    return source.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
  };

  const posts = postsQuery.data || [];

  const threadedComments = useMemo(() => {
    const parsedPosts = posts.map((post) => ({
      ...post,
      parsed: parseReplyPayload(post.content),
    }));

    const byId = new Map(parsedPosts.map((post) => [post.id, post]));
    const repliesByParent = new Map();
    const roots = [];

    for (const post of parsedPosts) {
      const parentId = post.parsed.replyToId;
      if (parentId && byId.has(parentId)) {
        const existingReplies = repliesByParent.get(parentId) || [];
        existingReplies.push(post);
        repliesByParent.set(parentId, existingReplies);
      } else {
        roots.push(post);
      }
    }

    return { roots, repliesByParent };
  }, [posts]);

  const handleReply = (post) => {
    const userName = post?.userName || 'unknown';
    const parsed = parseReplyPayload(post?.content || '');

    setReplyTarget({
      postId: post.id,
      userName,
      quoteText: parsed.body,
    });
    setNewComment('');

    if (composerRef.current) {
      composerRef.current.focus();
    }
  };

  const handleQuoteClick = (targetPostId) => {
    const targetRef = postRefsMap.current.get(targetPostId);
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const renderCommentCard = (post, forumUserName, isReply = false) => {
    const summary = groupedReaction(post);

    return (
      <motion.article
        ref={(el) => {
          if (el) {
            postRefsMap.current.set(post.id, { current: el });
          }
        }}
        key={`${isReply ? 'reply' : 'root'}-${post.id}`}
        className={`comment-card${isReply ? ' reply-card' : ''}`}
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="comment-header">
          <div className="user-avatar">{(post.userName || 'unknown').charAt(0).toUpperCase()}</div>
          <div className="user-info">
            <strong>{post.userName || 'unknown'}</strong>
            <span className="timestamp">{new Date(post.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {post.parsed.quoteText && (
          <blockquote className="quote-box" onClick={() => post.parsed.replyToId && handleQuoteClick(post.parsed.replyToId)}>
            <div className="quote-user">@{post.parsed.quoteUser || 'unknown'}</div>
            <p>{post.parsed.quoteText}</p>
          </blockquote>
        )}

        <p className="comment-body">{post.parsed.body}</p>

        <div className="comment-actions">
          <button type="button" className="reply-btn" onClick={() => handleReply(post)}>
            Trả lời
          </button>
          {post.userName === forumUserName && (
            <>
              <button
                type="button"
                className="icon-btn-small"
                title="Chỉnh sửa"
                onClick={() => setEditingPost(post)}
              >
                <Edit size={14} />
              </button>
              <button
                type="button"
                className="icon-btn-small"
                title="Xóa"
                onClick={() => setDeleteConfirmPostId(post.id)}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>

        <div className="reaction-row">
          {REACTION_TYPES.map((type) => {
            const IconComponent = REACTION_ICONS[type];
            const isOwnPost = post.userName === forumUserName;
            return (
              <motion.button
                whileTap={{ scale: 0.92 }}
                key={`${post.id}-${type}`}
                className="icon-btn"
                type="button"
                title={isOwnPost ? "Bạn không thể react bài của chính mình" : type}
                disabled={isOwnPost}
                onClick={() => {
                  if (!isOwnPost) {
                    reactMutation.mutate({ postId: post.id, type, userName: forumUserName });
                  }
                }}
                style={{
                  opacity: isOwnPost ? 0.5 : 1,
                  cursor: isOwnPost ? 'not-allowed' : 'pointer',
                }}
              >
                <IconComponent size={16} />
                {summary[type] ? summary[type] : ''}
              </motion.button>
            );
          })}
        </div>
      </motion.article>
    );
  };

  return (
    <ForumLayout rightStats={{ left: 1, right: posts.length }}>
      {(forumUserName) => (
        <section className="panel page-panel">
          <div className="page-toolbar">
            <button className="ghost-btn" onClick={() => navigate(`/forum/categories/${categoryId}/threads`)}><ArrowLeft size={14} /> Threads</button>
          </div>

          <div className="panel-head"><MessageCircle size={16} /><h2>Comments {threadQuery.data ? `• ${threadQuery.data.title}` : ''}</h2></div>

          {postsQuery.isError && <p className="empty-state">Không tải được comments.</p>}
          {!postsQuery.isLoading && !posts.length && <p className="empty-state">Thread này chưa có comment.</p>}

          <div className="comments-box">
            <AnimatePresence>
              {threadedComments.roots.map((post) => {
                const renderThread = (node, depth = 0) => {
                  const replies = threadedComments.repliesByParent.get(node.id) || [];

                  return (
                    <div key={`thread-${node.id}`} className="comment-thread">
                      {renderCommentCard(node, forumUserName, depth > 0)}
                      {replies.length > 0 && (
                        <div className="reply-stack">
                          {replies.map((replyNode) => renderThread(replyNode, depth + 1))}
                        </div>
                      )}
                    </div>
                  );
                };

                return renderThread(post);
              })}
            </AnimatePresence>
          </div>

          {editingPost && (
            <div className="modal-overlay" onClick={() => setEditingPost(null)}>
              <motion.div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <h3>Chỉnh sửa bình luận</h3>
                <textarea
                  autoFocus
                  rows={5}
                  defaultValue={editingPost.parsed.body}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setEditingPost(null);
                  }}
                  id="edit-textarea"
                  placeholder="Nhập nội dung chỉnh sửa..."
                />
                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={() => setEditingPost(null)}>Hủy</button>
                  <button
                    type="button"
                    className="primary-btn"
                    disabled={updatePostMutation.isPending}
                    onClick={() => {
                      const newContent = document.getElementById('edit-textarea').value.trim();
                      if (newContent) {
                        updatePostMutation.mutate({
                          postId: editingPost.id,
                          content: newContent,
                        });
                      }
                    }}
                  >
                    {updatePostMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {deleteConfirmPostId && (
            <div className="modal-overlay" onClick={() => setDeleteConfirmPostId(null)}>
              <motion.div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <h3>Xác nhận xóa</h3>
                <p>Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.</p>
                <div className="modal-actions">
                  <button type="button" className="ghost-btn" onClick={() => setDeleteConfirmPostId(null)}>Hủy</button>
                  <button
                    type="button"
                    className="danger-btn"
                    disabled={deletePostMutation.isPending}
                    onClick={() => deletePostMutation.mutate(deleteConfirmPostId)}
                  >
                    {deletePostMutation.isPending ? 'Đang xóa...' : 'Xóa'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          <form
            className="stack-form comment-composer"
            onSubmit={(e) => {
              e.preventDefault();
              const body = newComment.trim();
              if (!body) {
                return;
              }

              const content = replyTarget
                ? buildReplyPayload(replyTarget, body)
                : body;

              createCommentMutation.mutate({ content, userName: forumUserName });
            }}
          >
            {replyTarget && (
              <div className="reply-context">
                <span>Đang trả lời @{replyTarget.userName}</span>
                <button type="button" className="reply-btn" onClick={() => setReplyTarget(null)}>
                  Hủy
                </button>
              </div>
            )}

            <textarea
              ref={composerRef}
              rows={4}
              placeholder={replyTarget ? `Trả lời @${replyTarget.userName}...` : 'Để lại luận điểm, tín hiệu kỹ thuật, quản trị rủi ro...'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            />
            <button type="submit" className="primary-btn" disabled={!forumUserName || createCommentMutation.isPending}>Gửi comment</button>
          </form>
        </section>
      )}
    </ForumLayout>
  );
}

export default ThreadCommentsPage;
