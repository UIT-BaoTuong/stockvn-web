import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CategoriesPage from './forum/CategoriesPage';
import ProfilePage from './forum/ProfilePage';
import ThreadCommentsPage from './forum/ThreadCommentsPage';
import ThreadsPage from './forum/ThreadsPage';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import Register from './Register';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolvedTheme = savedTheme || (systemDark ? 'dark' : 'light');
    setTheme(resolvedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <button
        className="theme-toggle"
        onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <Routes>
        <Route path="/" element={<Navigate to="/forum/categories" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Navigate to="/forum/categories" replace />} />
          <Route path="/forum/categories" element={<CategoriesPage />} />
          <Route path="/forum/profile" element={<ProfilePage />} />
          <Route path="/forum/categories/:categoryId/threads" element={<ThreadsPage />} />
          <Route path="/forum/categories/:categoryId/threads/:threadId" element={<ThreadCommentsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/forum/categories" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;