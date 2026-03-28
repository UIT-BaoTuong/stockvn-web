import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authClient } from './api';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await authClient.getPublicStats();
        setUserCount(response.data.totalUsers || 0);
      } catch (err) {
        console.error('Lỗi khi lấy thống kê user:', err);
      }
    };
    fetchUserStats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authClient.login(formData);
      const accessToken = response.data.accessToken || response.data.token;
      const refreshToken = response.data.refreshToken;

      if (!accessToken) {
        throw new Error('Không nhận được access token từ server');
      }

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      toast.success('Đăng nhập thành công');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Đăng nhập thất bại';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell auth-shell-single">
      <motion.div
        className="auth-card"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="auth-header">
          <h1>Stock Forum</h1>
          <p>Đăng nhập để thảo luận mã chứng khoán theo thời gian thực</p>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-footnote">
          Chưa có tài khoản? <Link to="/register">Tạo tài khoản mới</Link>
        </p>
      </motion.div>

    </div>
  );
}

export default Login;