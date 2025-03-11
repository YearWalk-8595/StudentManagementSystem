import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('密码重置错误:', error.message);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return '无效的电子邮件地址';
      case 'auth/user-not-found':
        return '没有找到此电子邮件对应的用户';
      case 'auth/too-many-requests':
        return '请求次数过多，请稍后再试';
      default:
        return '发送重置密码邮件时发生错误，请重试';
    }
  };

  return (
    <div className="auth-container">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>重置密码</h2>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">重置密码链接已发送到您的邮箱，请查收</div>}
      
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
        
        <button type="submit" disabled={loading}>
          {loading ? '发送中...' : '发送重置密码链接'}
        </button>
      </form>
      
      <Link to="/login" className="auth-link">
        返回登录
      </Link>
    </div>
  );
}

export default ForgotPassword;