import React, { useState, useEffect } from 'react';
import { fetchPointsHistory, fetchAllStudents, transferPoints } from '../services/pointsService';
import { useStudentData } from '../services/studentService';
import { auth } from '../firebase';
import './PointsManagement.css';

function PointsManagement() {
  const [pointsHistory, setPointsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [transferAmount, setTransferAmount] = useState(10);
  const [transferReason, setTransferReason] = useState('');
  const [transferError, setTransferError] = useState(null);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [loadingTransfer, setLoadingTransfer] = useState(false);
  
  const itemsPerPage = 10;
  const user = auth.currentUser;
  const { studentData } = useStudentData(user?.email);

  // 加载积分流水记录
  useEffect(() => {
    const loadPointsHistory = async () => {
      if (!studentData) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const history = await fetchPointsHistory(studentData.fields.学号);
        setPointsHistory(history);
      } catch (err) {
        console.error('加载积分流水失败:', err);
        setError('加载积分流水失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadPointsHistory();
  }, [studentData]);

  // 加载所有学生列表（用于转账功能）
  useEffect(() => {
    const loadStudents = async () => {
      if (!studentData || !showTransferModal) return;
      
      try {
        const allStudents = await fetchAllStudents();
        // 过滤掉当前学生
        const filteredStudents = allStudents.filter(student => 
          student.fields.学号 !== studentData.fields.学号
        );
        setStudents(filteredStudents);
      } catch (err) {
        console.error('加载学生列表失败:', err);
        setTransferError('加载学生列表失败，请稍后再试');
      }
    };
    
    loadStudents();
  }, [studentData, showTransferModal]);

  // 处理分页
  const totalPages = Math.ceil(pointsHistory.length / itemsPerPage);
  const currentItems = pointsHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 处理页码变更
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // 打开转账模态框
  const openTransferModal = () => {
    setShowTransferModal(true);
    setTransferError(null);
    setTransferSuccess(false);
    setSelectedStudent('');
    setTransferAmount(10);
    setTransferReason('');
  };

  // 关闭转账模态框
  const closeTransferModal = () => {
    setShowTransferModal(false);
  };

  // 处理转账
  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      setTransferError('请选择转账对象');
      return;
    }
    
    if (transferAmount <= 0) {
      setTransferError('转账金额必须大于0');
      return;
    }
    
    if (transferAmount > studentData.fields.当前积分) {
      setTransferError('转账金额不能超过当前积分');
      return;
    }
    
    if (!transferReason.trim()) {
      setTransferError('请填写转账理由');
      return;
    }
    
    setLoadingTransfer(true);
    setTransferError(null);
    
    try {
      await transferPoints(
        studentData.fields.学号,
        selectedStudent,
        transferAmount,
        transferReason
      );
      
      setTransferSuccess(true);
      
      // 重新加载积分流水
      const history = await fetchPointsHistory(studentData.fields.学号);
      setPointsHistory(history);
      
      // 3秒后关闭模态框
      setTimeout(() => {
        closeTransferModal();
        setTransferSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('转账失败:', err);
      setTransferError(err.message || '转账失败，请稍后再试');
    } finally {
      setLoadingTransfer(false);
    }
  };

  // 格式化日期
  const formatDate = (timestamp) => {
    if (!timestamp) return '未知时间';
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 格式化积分变化
  const formatPointsChange = (amount, type) => {
    if (type === '增加') {
      return `+${amount}`;
    } else {
      return `-${amount}`;
    }
  };

  return (
    <div className="points-management-container">
      <div className="points-overview">
        <h3>积分概览</h3>
        <div className="points-info">
          <div className="points-item">
            <span className="points-label">当前积分:</span>
            <span className="points-value">{studentData?.fields.当前积分 || 0}</span>
          </div>
          <div className="points-item">
            <span className="points-label">历史总积分:</span>
            <span className="points-value">{studentData?.fields.历史总积分 || 0}</span>
          </div>
        </div>
      </div>

      <div className="points-history">
        <div className="history-header">
          <h3>积分流水</h3>
          <button className="transfer-btn" onClick={openTransferModal}>积分转账</button>
        </div>

        {loading && <div className="loading">加载中...</div>}
        
        {error && <div className="error-message">{error}</div>}
        
        {!loading && !error && (
          <>
            {currentItems.length === 0 ? (
              <div className="no-records">暂无积分记录</div>
            ) : (
              <div className="history-table-container">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>时间</th>
                      <th>积分变化</th>
                      <th>理由</th>
                      <th>审核状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((record) => (
                      <tr key={record.recordId}>
                        <td>{formatDate(record.fields.流水时间 || record.createdAt)}</td>
                        <td className={record.fields.增减 === '增加' ? 'points-increase' : 'points-decrease'}>
                          {formatPointsChange(record.fields.积分变化量, record.fields.增减)}
                        </td>
                        <td>{record.fields.理由 || '无'}</td>
                        <td>
                          <span className={`status-${record.fields.审批状态 === '已通过' ? 'approved' : record.fields.审批状态 === '已拒绝' ? 'rejected' : 'pending'}`}>
                            {record.fields.审批状态 || '待审核'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  首页
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  上一页
                </button>
                <span className="page-info">{currentPage} / {totalPages}</span>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  下一页
                </button>
                <button 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  末页
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 积分转账模态框 */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="transfer-modal">
            <div className="modal-header">
              <h3>积分转账</h3>
              <button className="close-btn" onClick={closeTransferModal}>×</button>
            </div>
            
            {transferSuccess ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <p>转账成功！</p>
              </div>
            ) : (
              <form onSubmit={handleTransfer} className="transfer-form">
                <div className="form-group">
                  <label>转账对象:</label>
                  <select 
                    value={selectedStudent} 
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    required
                  >
                    <option value="">请选择转账对象</option>
                    {students.map((student) => (
                      <option key={student.recordId} value={student.fields.学号}>
                        {student.fields.姓名} ({student.fields.学号})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>转账积分:</label>
                  <div className="points-input-group">
                    <button 
                      type="button" 
                      className="adjust-btn"
                      onClick={() => setTransferAmount(prev => Math.max(1, prev - 1))}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      value={transferAmount} 
                      onChange={(e) => setTransferAmount(parseInt(e.target.value) || 0)}
                      min="1"
                      max={studentData?.fields.当前积分 || 0}
                      required
                    />
                    <button 
                      type="button" 
                      className="adjust-btn"
                      onClick={() => setTransferAmount(prev => Math.min(studentData?.fields.当前积分 || 0, prev + 1))}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>转账理由:</label>
                  <textarea 
                    value={transferReason} 
                    onChange={(e) => setTransferReason(e.target.value)}
                    placeholder="请输入转账理由"
                    required
                  />
                </div>
                
                {transferError && <div className="error-message">{transferError}</div>}
                
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={closeTransferModal}>取消</button>
                  <button 
                    type="submit" 
                    className="confirm-btn"
                    disabled={loadingTransfer}
                  >
                    {loadingTransfer ? '处理中...' : '确认转账'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PointsManagement;