import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error('登录错误:', error.message);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };



  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return '无效的电子邮件地址';
      case 'auth/user-disabled':
        return '此用户账号已被禁用';
      case 'auth/user-not-found':
        return '没有找到此电子邮件对应的用户';
      case 'auth/wrong-password':
        return '密码不正确';
      case 'auth/too-many-requests':
        return '登录尝试次数过多，请稍后再试';
      default:
        return '登录时发生错误，请重试';
    }
  };

  return (
    <div className="auth-container">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>登录</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">电子邮件</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">密码</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      
      <Link to="/forgot-password" className="auth-link">
        忘记密码？
      </Link>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        还没有账号？ <Link to="/register" className="auth-link" style={{ display: 'inline' }}>注册</Link>
      </p>
    </div>
  );
}

export default Login;