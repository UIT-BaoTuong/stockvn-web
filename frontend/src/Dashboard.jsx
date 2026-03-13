import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await api.get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        localStorage.removeItem('accessToken');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-screen">
          <div className="loader-circle"></div>
          <p>Đang khởi tạo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="2" width="10" height="10" stroke="url(#gradient1)" strokeWidth="1.5" rx="2"/>
              <rect x="16" y="2" width="10" height="10" stroke="url(#gradient2)" strokeWidth="1.5" rx="2"/>
              <rect x="2" y="16" width="10" height="10" stroke="url(#gradient2)" strokeWidth="1.5" rx="2"/>
              <rect x="16" y="16" width="10" height="10" stroke="url(#gradient1)" strokeWidth="1.5" rx="2"/>
              <defs>
                <linearGradient id="gradient1" x1="0" y1="0" x2="12" y2="12">
                  <stop offset="0%" stopColor="#00D9FF"/>
                  <stop offset="100%" stopColor="#B26FFF"/>
                </linearGradient>
                <linearGradient id="gradient2" x1="0" y1="0" x2="12" y2="12">
                  <stop offset="0%" stopColor="#B26FFF"/>
                  <stop offset="100%" stopColor="#00D9FF"/>
                </linearGradient>
              </defs>
            </svg>
            <span>Xenforo</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-label">CHÍNH</p>
            <a href="#overview" className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 10L10 2L18 10V17H12V13H8V17H2V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Dashboard v1.0.2</span>
            </a>
            <a href="#community" className={`nav-item ${activeTab === 'community' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('community'); }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="13" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 10C3 8 5 7 7 7C9 7 11 8 11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M9 10C9 8 11 7 13 7C15 7 17 8 17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2 18C2 15 4 13 10 13C16 13 18 15 18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Cộng đồng</span>
            </a>
            <a href="#posts" className={`nav-item ${activeTab === 'posts' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('posts'); }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 2H17C18.1046 2 19 2.89543 19 4V16C19 17.1046 18.1046 18 17 18H3C1.89543 18 1 17.1046 1 16V4C1 2.89543 1.89543 2 3 2Z" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="3" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>Bài viết</span>
            </a>
            <a href="#messages" className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('messages'); }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 8C2 6.89543 2.89543 6 4 6H16C17.1046 6 18 6.89543 18 8V14C18 15.1046 17.1046 16 16 16H4C2.89543 16 2 15.1046 2 14V8Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 8L10 13L18 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Tin nhắn</span>
            </a>
          </div>

          <div className="nav-section">
            <p className="nav-label">CÀI ĐẶT</p>
            <a href="#settings" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 3.5V2M10 18V16.5M16.5 10H18M2 10H3.5M14.5 14.5L15.8 15.8M4.2 4.2L5.5 5.5M14.5 5.5L15.8 4.2M5.5 15.8L4.2 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Cài đặt</span>
            </a>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini">
            <div className="avatar">{userProfile?.username?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <p>{userProfile?.username || 'User'}</p>
              <span>Member</span>
            </div>
          </div>
          <button className="logout-icon" onClick={handleLogout} title="Đăng xuất">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 2H14V16H7M11 7L6 12L11 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <h1>Dashboard</h1>
            <p className="subtitle">Quản lý trang web của bạn</p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="12.5" y1="12.5" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="Tìm kiếm..." />
            </div>
            <button className="notification-btn">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 8C5 5.24 7.24 3 10 3C12.76 3 15 5.24 15 8C15 14 18 17 18 17H2C2 17 5 14 5 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="10" cy="18" r="1" fill="currentColor"/>
              </svg>
              <span className="badge">0</span>
            </button>
          </div>
        </header>

        {/* Content Grid */}
        <div className="content">
          {/* Welcome Card */}
          <section className="welcome-section">
            <div className="welcome-card">
              <div className="welcome-header">
                <div>
                  <h2>Chào mừng trở lại!</h2>
                  <p>Quản lý trang web Xenforo Clone của bạn</p>
                </div>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="url(#grad)" strokeWidth="2" opacity="0.3"/>
                  <path d="M24 16V24L30 30" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48">
                      <stop offset="0%" stopColor="#00D9FF"/>
                      <stop offset="100%" stopColor="#B26FFF"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              {userProfile && (
                <div className="user-profile-info">
                  <div className="profile-item">
                    <span className="label">Tên đăng nhập</span>
                    <span className="value">{userProfile.username}</span>
                  </div>
                  <div className="divider"></div>
                  <div className="profile-item">
                    <span className="label">Email</span>
                    <span className="value">{userProfile.email}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Stats Grid */}
          <section className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12C3 7.58 6.58 4 12 4C17.42 4 21 7.58 21 12C21 16.42 17.42 20 12 20C6.58 20 3 16.42 3 12Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 7V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Bài viết</h3>
                <div className="metric-value">0</div>
                <span className="metric-change">Bản nháp: 0</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M12 7V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Bình luận</h3>
                <div className="metric-value">0</div>
                <span className="metric-change">Chưa phê duyệt: 0</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon cyan">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="2" fill="currentColor"/>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Theo dõi</h3>
                <div className="metric-value">0</div>
                <span className="metric-change">Yêu cầu: 0</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10" cy="14.5" r="1" fill="currentColor"/>
                </svg>
              </div>
              <div className="metric-content">
                <h3>Hoạt động</h3>
                <div className="metric-value">Hoạt</div>
                <span className="metric-change">Online</span>
              </div>
            </div>
          </section>

          {/* Activity Section */}
          <section className="activity-section">
            <div className="activity-card">
              <h3>Hoạt động gần đây</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon info">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M8 5V8L10.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="activity-info">
                    <p>Bạn đã đăng nhập</p>
                    <span>Vừa xong</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon success">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="activity-info">
                    <p>Tài khoản được tạo</p>
                    <span>Hôm nay</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Tác vụ nhanh</h3>
              <div className="action-buttons">
                <button className="action-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2V18M2 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Bài viết mới
                </button>
                <button className="action-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 7H17C18.1046 7 19 7.89543 19 9V15C19 16.1046 18.1046 17 17 17H3C1.89543 17 1 16.1046 1 15V9C1 7.89543 1.89543 7 3 7Z" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M1 9L10 13L19 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Gửi tin nhắn
                </button>
                <button className="action-btn">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Lịch sử
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
