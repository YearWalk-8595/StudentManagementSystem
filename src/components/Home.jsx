import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useStudentData } from '../services/studentService';

function Home({ user }) {
  const isEmailVerified = user.emailVerified;
  const { studentData, loading, error } = useStudentData(user.email);

  const handleResendVerification = async () => {
    try {
      await user.sendEmailVerification();
      alert('验证邮件已发送，请查收您的邮箱');
    } catch (error) {
      console.error('发送验证邮件错误:', error.message);
      alert('发送验证邮件失败，请稍后再试');
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h2>欢迎使用学生管理系统</h2>
        
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
          <h3>用户信息</h3>
          <p><strong>邮箱:</strong> {user.email}</p>
          <p><strong>邮箱验证状态:</strong> {isEmailVerified ? '已验证' : '未验证'}</p>
          <p><strong>用户ID:</strong> {user.uid}</p>
          <p><strong>账号创建时间:</strong> {user.metadata.creationTime}</p>
          <p><strong>最近登录时间:</strong> {user.metadata.lastSignInTime}</p>
          {loading && <p><strong>学生信息:</strong> 加载中...</p>}
          {error && <p style={{ color: 'red' }}><strong>错误:</strong> {error}</p>}
          {studentData && (
            <div>
              <h4>学生详细信息</h4>
              <p><strong>姓名:</strong> {studentData.fields.姓名}</p>
              <p><strong>学号:</strong> {studentData.fields.学号}</p>
              <p><strong>性别:</strong> {studentData.fields.性别}</p>
              <p><strong>当前积分:</strong> {studentData.fields.当前积分}</p>
              <p><strong>历史总积分:</strong> {studentData.fields.历史总积分}</p>
            </div>
          )}
          
          {!isEmailVerified && (
            <div style={{ marginTop: '15px' }}>
              <p style={{ color: '#0000FF', marginBottom: '10px', fontSize: '18px' }}>欢迎用户登入</p>
              <button 
                onClick={() => window.location.href = '/student-system'}
                style={{ 
                  width: 'auto', 
                  padding: '8px 15px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                进入学生信息系统
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;