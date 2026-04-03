import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authClient } from './api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    try {
      await authClient.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setSuccessMessage('Đăng ký thành công. Bạn có thể đăng nhập ngay.');
      toast.success('Đăng ký thành công');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng ký thất bại';
      setErrors({ submit: message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <motion.div
        className="auth-card"
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <div className="auth-header">
          <h1>Tạo tài khoản</h1>
          <p>Đăng ký để tham gia thảo luận chứng khoán</p>
        </div>

        {errors.submit && <div className="alert error">{errors.submit}</div>}
        {successMessage && <div className="alert success">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            id="username"
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            value={formData.username}
            onChange={handleChange}
            className={errors.username ? 'input-error' : ''}
          />
          {errors.username && <span className="field-error">{errors.username}</span>}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}

          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Ít nhất 6 ký tự"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? 'input-error' : ''}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}

          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? 'input-error' : ''}
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}

          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-footnote">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </motion.div>

      <motion.aside
        className="auth-side-info"
        initial={{ x: 18, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <h2>Tư duy cộng đồng, kỷ luật dữ liệu</h2>
        <ul>
          <li>Theo dõi mã theo category</li>
          <li>Phân tích kỹ thuật và cơ bản theo thread</li>
          <li>Tương tác nhanh bằng reaction theo quan điểm</li>
        </ul>
      </motion.aside>
    </div>
  );
}

export default Register;
