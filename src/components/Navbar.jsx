import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('登出错误:', error.message);
    }
  };

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo">学生管理系统</Link>
      <div className="nav-links">
        {user ? (
          <>
            <span className="nav-link">欢迎, {user.email}</span>
            <button 
              onClick={handleLogout} 
              style={{ 
                width: 'auto', 
                padding: '5px 15px',
                marginLeft: '10px' 
              }}
            >
              登出
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">登录</Link>
            <Link to="/register" className="nav-link">注册</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;