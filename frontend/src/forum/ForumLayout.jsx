import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { LogOut, LogIn, MessageCircle, TrendingUp, User, UserCheck, Users } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authClient, resolveAuthAssetUrl } from '../api';
import { useAuthProfile } from './useAuthProfile';

function ForumLayout({ rightStats, children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  const profileQuery = useAuthProfile();
  const forumStatsQuery = useQuery({
    queryKey: ['forum-stats'],
    queryFn: async () => {
      const response = await authClient.forumStats();
      return response.data;
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });

  useEffect(() => {
    if (token && profileQuery.isError) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.error('Phiên đăng nhập đã hết hạn.');
      navigate('/login');
    }
  }, [navigate, token, profileQuery.isError]);

  const handleLogout = async () => {
    try {
      await authClient.logout();
    } catch (_error) {
      // Best-effort logout.
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    toast.success('Đã đăng xuất');
    navigate('/login');
  };

  if (token && profileQuery.isLoading) {
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

  const forumUserName = profileQuery.data?.username || '';
  const isGuest = !token;

  return (
    <div className="forum-shell">
      <motion.header className="topbar" initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div>
          <button className="topbar-brand" type="button" onClick={() => navigate('/forum/categories')}>
            <h1>Stock Forum</h1>
          </button>
          <p>{isGuest ? 'Khách truy cập' : `${forumUserName} • Forum member`}</p>
        </div>

        <div className="topbar-right">
          <div className="metric-chip"><TrendingUp size={14} /> {rightStats?.left || '0'} topics</div>
          <div className="metric-chip"><MessageCircle size={14} /> {rightStats?.right || '0'} comments</div>
          <div className="metric-chip"><Users size={14} /> {forumStatsQuery.data?.totalUsers ?? 0} users</div>
          <div className="metric-chip"><UserCheck size={14} /> {forumStatsQuery.data?.onlineUsers ?? 0} online</div>
          {isGuest ? (
            <button className="ghost-btn" onClick={() => navigate('/login')}>
              <LogIn size={15} /> Đăng nhập
            </button>
          ) : (
            <>
              <button className="metric-chip profile-chip" onClick={() => navigate('/forum/profile')} title={forumUserName}>
                {profileQuery.data?.avatarUrl ? (
                  <img src={resolveAuthAssetUrl(profileQuery.data.avatarUrl)} alt="avatar" className="chip-avatar" />
                ) : (
                  <User size={14} />
                )}
                {forumUserName}
              </button>
              <button className="ghost-btn" onClick={handleLogout}>
                <LogOut size={15} /> Đăng xuất
              </button>
            </>
          )}
        </div>
      </motion.header>

      {children(forumUserName)}
    </div>
  );
}

export default ForumLayout;
