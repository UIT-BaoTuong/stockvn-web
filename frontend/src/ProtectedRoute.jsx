import { useLocation, Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('accessToken');
  const location = useLocation();

  // Chỉ yêu cầu đăng nhập khi vào trang profile
  const isProfilePage = location.pathname === '/forum/profile';
  
  if (isProfilePage && !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;