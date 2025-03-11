import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码长度必须至少为6个字符');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      navigate('/');
    } catch (error) {
      console.error('注册错误:', error.message);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return '该电子邮件地址已被使用';
      case 'auth/invalid-email':
        return '无效的电子邮件地址';
      case 'auth/operation-not-allowed':
        return '邮箱/密码注册功能未启用';
      case 'auth/weak-password':
        return '密码强度太弱';
      default:
        return '注册时发生错误，请重试';
    }
  };

  return (
    <div className="auth-container">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>注册</h2>
      
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
        
        <div className="form-group">
          <label htmlFor="confirmPassword">确认密码</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? '注册中...' : '注册'}
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        已有账号？ <Link to="/login" className="auth-link" style={{ display: 'inline' }}>登录</Link>
      </p>
    </div>
  );
}

export default Register;