import axios from 'axios';

const AUTH_BASE_URL = '/api/auth'; 
const FORUM_BASE_URL = '/api/forum';

export const resolveAuthAssetUrl = (url) => {
  if (!url) {
    return '';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${AUTH_BASE_URL}${url}`;
  }
  return `${AUTH_BASE_URL}/${url}`;
};

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
});

const forumApi = axios.create({
  baseURL: FORUM_BASE_URL,
});

const withAccessToken = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const authClient = {
  register: (payload) => authApi.post('/auth/register', payload),
  login: (payload) => authApi.post('/auth/login', payload),
  logout: () => authApi.post('/auth/logout', null, { headers: withAccessToken() }),
  profile: () => authApi.get('/auth/profile', { headers: withAccessToken() }),
  forumStats: () => authApi.get('/auth/stats/forum', { headers: withAccessToken() }),
  getPublicStats: () => authApi.get('/auth/stats/forum'),
  updateAvatar: (payload) => authApi.put('/auth/profile/avatar', payload, { headers: withAccessToken() }),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return authApi.put('/auth/profile/avatar/upload', formData, {
      headers: {
        ...withAccessToken(),
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const forumClient = {
  getCategories: () => forumApi.get('/api/categories'),
  createCategory: (payload, userName) => forumApi.post('/api/categories', payload, {
    headers: userName ? { 'X-Forum-User': userName } : {},
  }),

  getThreadsByCategory: (categoryId) => forumApi.get(`/api/categories/${categoryId}/threads`),
  createThread: (categoryId, payload) => forumApi.post(`/api/categories/${categoryId}/threads`, payload),
  updateThread: (threadId, payload) => forumApi.put(`/api/threads/${threadId}`, payload),
  deleteThread: (threadId) => forumApi.delete(`/api/threads/${threadId}`),
  increaseThreadView: (threadId) => forumApi.post(`/api/threads/${threadId}/views`),

  getPostsByThread: (threadId) => forumApi.get(`/api/threads/${threadId}/posts`),
  createPost: (threadId, payload) => forumApi.post(`/api/threads/${threadId}/posts`, payload),
  updatePost: (postId, payload) => forumApi.put(`/api/posts/${postId}`, payload),
  deletePost: (postId) => forumApi.delete(`/api/posts/${postId}`),

  createOrUpdateReaction: (postId, payload) => forumApi.post(`/api/posts/${postId}/reactions`, payload),
  getReactionSummary: (postId) => forumApi.get(`/api/posts/${postId}/reactions/summary`),
  getUserStats: (userName) => forumApi.get(`/api/users/${encodeURIComponent(userName)}/stats`),
};