import React, { useState, useEffect } from 'react';
import { useExamData, useStudentGrades } from '../services/examService';
import { auth } from '../firebase';
import { useStudentData } from '../services/studentService';
import { Line } from 'react-chartjs-2';
import './GradeQuery.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function GradeQuery() {
  const [selectedExam, setSelectedExam] = useState(null);
  const { examData, loading: examLoading, error: examError } = useExamData();
  const user = auth.currentUser;
  const { studentData, loading: studentLoading } = useStudentData(user?.email);
  const { gradeData, loading: gradeLoading, error: gradeError } = useStudentGrades(studentData?.fields?.姓名);
  
  // 图表显示选项
  const [showMyScore, setShowMyScore] = useState(true); // 始终为true，不允许修改
  const [showHighestScore, setShowHighestScore] = useState(true);
  const [showLowestScore, setShowLowestScore] = useState(true);
  const [showAverageScore, setShowAverageScore] = useState(true);

  // 学期筛选选项
  const [selectedSemesters, setSelectedSemesters] = useState([]);
  
  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // 默认每页显示5条记录
  const pageSizeOptions = [5, 10, 15, 20]; // 每页显示数量选项
  
  // 所有可选学期
  const allSemesters = [
    '高一上学期',
    '高一下学期',
    '高二上学期',
    '高二下学期',
    '高三上学期',
    '高三下学期'
  ];

  // 处理学期选择变化
  const handleSemesterChange = (semester) => {
    setSelectedSemesters(prev => {
      if (prev.includes(semester)) {
        return prev.filter(s => s !== semester);
      } else {
        return [...prev, semester];
      }
    });
  };

  // 清除所有学期筛选
  const clearSemesterFilter = () => {
    setSelectedSemesters([]);
  };

  // 处理考试选择
  const handleExamSelect = (examId) => {
    setSelectedExam(examId);
  };

  // 获取学生在特定考试中的成绩
  const getStudentGradeForExam = (testId) => {
    if (!gradeData || gradeData.length === 0) return null;
    return gradeData.find(grade => grade.fields.test_ID === testId) || null;
  };

  // 准备图表数据
  const prepareChartData = () => {
    if (!examData || examData.length === 0 || !gradeData) return null;

    // 根据选中的学期筛选考试数据
    let filteredExams = [...examData];
    
    // 如果有选中的学期，则进行筛选
    if (selectedSemesters.length > 0) {
      filteredExams = filteredExams.filter(exam => 
        exam.fields.学期 && selectedSemesters.includes(exam.fields.学期)
      );
    }

    // 按日期排序的考试数据（最多显示10次考试）
    const sortedExams = filteredExams
      .sort((a, b) => {
        const dateA = a.fields.考试日期 || 0;
        const dateB = b.fields.考试日期 || 0;
        return dateA - dateB; // 按时间升序排序，图表从左到右显示时间线
      })
      .slice(-10); // 最多显示最近的10次考试

    const labels = sortedExams.map(exam => exam.fields.考试名称);
    
    // 学生成绩数据
    const studentScores = sortedExams.map(exam => {
      const grade = getStudentGradeForExam(exam.fields.test_ID);
      return grade ? grade.fields.考试分数 : null;
    });

    // 最高分、最低分和平均分数据
    const highestScores = sortedExams.map(exam => exam.fields.最高分 || null);
    const lowestScores = sortedExams.map(exam => exam.fields.最低分 || null);
    const averageScores = sortedExams.map(exam => exam.fields.平均分 || null);

    // 构建数据集
    const datasets = [];

    if (showMyScore) {
      datasets.push({
        label: '我的成绩',
        data: studentScores,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      });
    }

    if (showHighestScore) {
      datasets.push({
        label: '最高分',
        data: highestScores,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1
      });
    }

    if (showLowestScore) {
      datasets.push({
        label: '最低分',
        data: lowestScores,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.1
      });
    }

    if (showAverageScore) {
      datasets.push({
        label: '平均分',
        data: averageScores,
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.1
      });
    }

    return { labels, datasets };
  };

  // 图表配置
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '考试成绩趋势图',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '分数'
        }
      },
      x: {
        title: {
          display: true,
          text: '考试'
        }
      }
    }
  };

  // 格式化日期
  const formatDate = (timestamp) => {
    if (!timestamp) return '未知日期';
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // 渲染加载状态
  if (examLoading || studentLoading || gradeLoading) {
    return <div className="loading">加载中...</div>;
  }

  // 渲染错误状态
  if (examError || gradeError) {
    return <div className="error">加载数据失败: {examError || gradeError}</div>;
  }

  // 准备图表数据
  const chartData = prepareChartData();

  return (
    <div className="grade-query-container">
      <h3>成绩查询</h3>
      
      {/* 考试列表 */}
      <div className="exam-list-container">
        <h4>考试列表</h4>
        <div className="page-size-selector">
          <span>每页显示：</span>
          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // 重置到第一页
            }}
          >
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}条</option>
            ))}
          </select>
        </div>
        <div className="exam-list">
          <table>
            <thead>
              <tr>
                <th>考试名称</th>
                <th>考试日期</th>
                <th>考试类型</th>
                <th>学期</th>
                <th>考试范围</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {examData && examData
                // 根据学期筛选
                .filter(exam => selectedSemesters.length === 0 || (exam.fields.学期 && selectedSemesters.includes(exam.fields.学期)))
                // 按日期降序排序（最新的考试在前）
                .sort((a, b) => (b.fields.考试日期 || 0) - (a.fields.考试日期 || 0))
                // 分页处理
                .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                .map((exam) => (
                <tr key={exam.recordId} className={selectedExam === exam.fields.test_ID ? 'selected' : ''}>
                  <td>{exam.fields.考试名称}</td>
                  <td>{formatDate(exam.fields.考试日期)}</td>
                  <td>{exam.fields.考试类型}</td>
                  <td>{exam.fields.学期}</td>
                  <td>{exam.fields.考试范围 ? exam.fields.考试范围.join(', ') : '无'}</td>
                  <td>
                    <button 
                      onClick={() => handleExamSelect(exam.fields.test_ID)}
                      className={selectedExam === exam.fields.test_ID ? 'active' : ''}
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 分页控制 */}
        {examData && (
          <div className="pagination-controls">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              上一页
            </button>
            
            <span className="page-info">
              第 {currentPage} 页 / 共 {Math.ceil(examData.filter(exam => 
                selectedSemesters.length === 0 || 
                (exam.fields.学期 && selectedSemesters.includes(exam.fields.学期))
              ).length / pageSize)} 页
            </span>
            
            <button 
              onClick={() => setCurrentPage(prev => {
                const filteredExams = examData.filter(exam => 
                  selectedSemesters.length === 0 || 
                  (exam.fields.学期 && selectedSemesters.includes(exam.fields.学期))
                );
                const totalPages = Math.ceil(filteredExams.length / pageSize);
                return Math.min(prev + 1, totalPages);
              })}
              disabled={currentPage >= Math.ceil(examData.filter(exam => 
                selectedSemesters.length === 0 || 
                (exam.fields.学期 && selectedSemesters.includes(exam.fields.学期))
              ).length / pageSize)}
              className="pagination-btn"
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* 学生成绩详情 */}
      {selectedExam && (
        <div className="student-grade-details">
          <h4>成绩详情</h4>
          {(() => {
            const grade = getStudentGradeForExam(selectedExam);
            const exam = examData.find(e => e.fields.test_ID === selectedExam);
            
            if (!grade) {
              return <p>未找到该考试的成绩记录</p>;
            }
            
            return (
              <div className="grade-details-card">
                <h5>{exam?.fields.考试名称}</h5>
                <div className="grade-info">
                  {/* 第一行：考试日期和我的分数 */}
                  <div className="grade-row">
                    <div className="grade-item">
                      <span className="label">考试日期:</span>
                      <span className="value">{formatDate(exam?.fields.考试日期)}</span>
                    </div>
                    <div className="grade-item">
                      <span className="label">我的分数:</span>
                      <span className="value">{grade.fields.考试分数}</span>
                    </div>
                  </div>
                  
                  {/* 第二行：班级排名、校级排名、联考排名 */}
                  <div className="grade-row">
                    <div className="grade-item">
                      <span className="label">班级排名:</span>
                      <span className="value">{grade.fields.班级排名}</span>
                    </div>
                    <div className="grade-item">
                      <span className="label">校级排名:</span>
                      <span className="value">{grade.fields.校级排名}</span>
                    </div>
                    <div className="grade-item">
                      <span className="label">联考排名:</span>
                      <span className="value">{grade.fields.联考排名 || '无'}</span>
                    </div>
                  </div>
                  
                  {/* 第三行：班级平均分、最高分、最低分 */}
                  <div className="grade-row">
                    <div className="grade-item">
                      <span className="label">班级平均分:</span>
                      <span className="value">{exam?.fields.平均分 || '无'}</span>
                    </div>
                    <div className="grade-item">
                      <span className="label">最高分:</span>
                      <span className="value">{exam?.fields.最高分 || '无'}</span>
                    </div>
                    <div className="grade-item">
                      <span className="label">最低分:</span>
                      <span className="value">{exam?.fields.最低分 || '无'}</span>
                    </div>
                  </div>
                  
                  {/* 第四行：专科线、本科线、一本线 */}
                  <div className="grade-row">
                    <div className="grade-item">
                      <span className="label">专科线:</span>
                      <span className="value">{exam?.fields.专科线 || '无'}</span>
                    </div>
                    <div className="grade-item">
                      <span className="label">本科线:</span>
                      <span className="value">{exam?.fields.本科线 || '无'}</span>
                    </div>
                    <div className="grade-item">
                      <span className="label">一本线:</span>
                      <span className="value">{exam?.fields.一本线 || '无'}</span>
                    </div>
                  </div>
                  
                  {/* 第五行：高优线、双一流线、超一流线 */}
                  <div className="grade-row">
                    <div className="grade-item">
                      <span className="label">高优线:</span>
                      <span className="value">{exam?.fields.高优线 || '无'}</span>
                    </div>
                    <div className="grade-item">
                      <span className="label">双一流线:</span>
                      <span className="value">{exam?.fields.双一流线 || '无'}</span>
                    </div>
                    <div className="grade-item">
                      <span className="label">超一流线:</span>
                      <span className="value">{exam?.fields.超一流线 || '无'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 学期筛选 - 移动到成绩详情和成绩趋势图之间 */}
      <div className="semester-filter-container">
        <h4>学期筛选</h4>
        <div className="semester-filter">
          <div className="semester-checkboxes">
            {allSemesters.map(semester => (
              <label key={semester} className="semester-checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedSemesters.includes(semester)}
                  onChange={() => handleSemesterChange(semester)}
                />
                <span>{semester}</span>
              </label>
            ))}
          </div>
          <button 
            className="clear-filter-btn"
            onClick={clearSemesterFilter}
            disabled={selectedSemesters.length === 0}
          >
            清除筛选
          </button>
        </div>
      </div>

      {/* 成绩趋势图 */}
      <div className="grade-chart-container">
        <h4>成绩趋势图</h4>
        
        {/* 图表筛选选项 */}
        <div className="chart-options">
          <label>
            <input 
              type="checkbox" 
              checked={showMyScore} 
              disabled={true} // 禁用复选框，不允许取消选择
            />
            我的成绩
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={showHighestScore} 
              onChange={() => setShowHighestScore(!showHighestScore)} 
            />
            最高分
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={showLowestScore} 
              onChange={() => setShowLowestScore(!showLowestScore)} 
            />
            最低分
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={showAverageScore} 
              onChange={() => setShowAverageScore(!showAverageScore)} 
            />
            平均分
          </label>
        </div>
        
        {/* 图表 */}
        <div className="chart-wrapper">
          {chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p>暂无成绩数据可供显示</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default GradeQuery;