import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { fetchStudentData } from '../services/studentService';

function StudentSystem() {
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loadStudentData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchStudentData();
        setStudentData(data);
      } catch (err) {
        console.error('加载学生数据失败:', err);
        setError('加载学生数据失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadStudentData();
  }, []);

  // 过滤学生数据
  const filteredStudents = studentData.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const name = student.fields.姓名 || '';
    const id = student.fields.学号 || '';
    
    return name.toLowerCase().includes(searchLower) || 
           id.toLowerCase().includes(searchLower);
  });

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>学生信息系统</h2>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="搜索学生姓名或学号..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
      </div>

      {loading && <div>加载中...</div>}
      
      {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}
      
      {!loading && !error && (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <strong>共找到 {filteredStudents.length} 名学生</strong>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>姓名</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>学号</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>性别</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>当前积分</th>
                  <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>历史总积分</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.recordId} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{student.fields.姓名}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{student.fields.学号}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{student.fields.性别}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{student.fields.当前积分}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{student.fields.历史总积分}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentSystem;