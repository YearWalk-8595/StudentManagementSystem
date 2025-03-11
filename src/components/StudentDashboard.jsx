import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useStudentData } from '../services/studentService';
import GradeQuery from './GradeQuery';
import PointsManagement from './PointsManagement';
import PointsStore from './PointsStore';

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('personal');
  const navigate = useNavigate();
  const user = auth.currentUser;
  const { studentData, loading, error } = useStudentData(user?.email);
  
  // 奖牌获取需求数据
  const medalRequirements = {
    '学习达人': {
      '初级': '累计2次考试及格',
      '中级': '累计5次考试及格',
      '高级': '累计10次考试及格',
      '大师': '累计20次考试及格',
      '至尊': '累计35次考试及格'
    },
    '积分之王': {
      '初级': '最近一个月积分排名前10',
      '中级': '最近一个月积分排名前5',
      '高级': '最近一个月积分排名前3',
      '大师': '最近一个月积分排名第一',
      '至尊': '上一学期积分排名保持第一'
    },
    '进步之星': {
      '初级': '最近一次考试班级进步1名',
      '中级': '最近一次考试班级进步2名',
      '高级': '最近一次考试班级进步3名',
      '大师': '最近一次考试班级进步4名或以上',
      '至尊': '连续保持两次无可进步'
    },
    '不拖后腿': {
      '初级': '累计2次考试得分高于班级均分',
      '中级': '累计5次考试得分高于班级均分',
      '高级': '累计10次考试得分高于班级均分',
      '大师': '累计20次考试得分高于班级均分',
      '至尊': '累计35次考试得分高于班级均分'
    },
    '勤奋学子': {
      '初级': '累计2次考试60分以上',
      '中级': '累计5次考试60分以上',
      '高级': '累计10次考试60分以上',
      '大师': '累计20次考试60分以上',
      '至尊': '累计35次考试60分以上'
    },
    '知识探求者': {
      '初级': '累计1次考试120分以上',
      '中级': '累计2次考试120分以上',
      '高级': '累计3次考试120分以上',
      '大师': '累计5次考试120分以上',
      '至尊': '累计10次考试120分以上'
    },
    '全勤达人': {
      '初级': '累计完成5次作业',
      '中级': '累计完成12次作业',
      '高级': '累计完成25次作业',
      '大师': '累计完成50次作业',
      '至尊': '累计完成80次作业'
    },
    '白金奖牌': {
      '初级': '累计1次考试排名班级第一',
      '中级': '累计2次考试排名班级第一',
      '高级': '累计3次考试排名班级第一',
      '大师': '最近3次考试排名均为班级第一',
      '至尊': '上一学期考试均为班级第一'
    },
    '怒火中烧': {
      '初级': '惹怒老师3次',
      '中级': '惹怒老师5次',
      '高级': '惹怒老师10次',
      '大师': '本学期一直惹怒老师',
      '至尊': '让老师记恨上'
    }
  };

  // 渲染个人中心内容
  const renderPersonalCenter = () => {
    if (loading) return <div className="content-loading">加载中...</div>;
    if (error) return <div className="content-error">{error}</div>;
    if (!studentData) return <div className="content-error">未找到学生信息</div>;

    // 从API获取的奖牌数据
    const medalTypes = [
      { id: 'learning_master', name: '学习达人', field: '学习达人' },
      { id: 'points_king', name: '积分之王', field: '积分之王' },
      { id: 'progress_star', name: '进步之星', field: '进步之星' },
      { id: 'not_lagging', name: '不拖后腿', field: '不拖后腿' },
      { id: 'diligent_student', name: '勤奋学子', field: '勤奋学子' },
      { id: 'knowledge_seeker', name: '知识探求者', field: '知识探求者' },
      { id: 'full_attendance', name: '全勤达人', field: '全勤达人' },
      { id: 'platinum_medal', name: '白金奖牌', field: '白金奖牌' },
      { id: 'anger_medal', name: '怒火中烧', field: '怒火中烧' },
    ];

    // 获取奖牌等级对应的样式和图标
    const getMedalStyle = (level) => {
      switch(level) {
        case '初级':
          return { className: 'medal-blue', icon: '🏅', status: '初级' };
        case '中级':
          return { className: 'medal-gold', icon: '🏅', status: '中级' };
        case '高级':
          return { className: 'medal-orange', icon: '🏅', status: '高级' };
        case '大师':
          return { className: 'medal-rainbow', icon: '🌟', status: '大师' };
        case '至尊':
          return { className: 'medal-supreme', icon: '👑', status: '至尊' };
        default:
          return { className: 'medal-locked', icon: '🔒', status: '未获得' };
      }
    };

    return (
      <div className="personal-center">
        <h3>个人信息</h3>
        <div className="info-card">
          <div className="student-info">
            <div className="info-item">
              <span className="info-label">姓名:</span>
              <span className="info-value">{studentData.fields.姓名}</span>
            </div>
            <div className="info-item">
              <span className="info-label">学号:</span>
              <span className="info-value">{studentData.fields.学号}</span>
            </div>
            <div className="info-item">
              <span className="info-label">性别:</span>
              <span className="info-value">{studentData.fields.性别}</span>
            </div>
            <div className="info-item">
              <span className="info-label">当前积分:</span>
              <span className="info-value">{studentData.fields.当前积分}</span>
            </div>
            <div className="info-item">
              <span className="info-label">历史总积分:</span>
              <span className="info-value">{studentData.fields.历史总积分}</span>
            </div>
          </div>
        </div>

        <h3>奖牌获取情况</h3>
        <div className="medals-container">
          {medalTypes.map((medal) => {
            const medalLevel = studentData.fields[medal.field] || '无';
            const { className, icon, status } = getMedalStyle(medalLevel);
            
            // 获取当前奖牌的获取需求
            const getRequirementText = (medalName, level) => {
              if (level === '无' || level === '未获得') {
                // 显示所有等级的获取需求
                return `获取条件:\n初级: ${medalRequirements[medalName]['初级']}\n中级: ${medalRequirements[medalName]['中级']}\n高级: ${medalRequirements[medalName]['高级']}\n大师: ${medalRequirements[medalName]['大师']}\n至尊: ${medalRequirements[medalName]['至尊']}`;
              } else {
                // 显示当前等级和更高等级的获取需求
                const levels = ['初级', '中级', '高级', '大师', '至尊'];
                const currentLevelIndex = levels.indexOf(level);
                let requirementText = `当前等级: ${level}\n获取条件: ${medalRequirements[medalName][level]}\n`;
                
                // 添加下一等级的获取需求（如果有）
                if (currentLevelIndex < levels.length - 1) {
                  const nextLevel = levels[currentLevelIndex + 1];
                  requirementText += `\n下一等级: ${nextLevel}\n获取条件: ${medalRequirements[medalName][nextLevel]}`;
                }
                
                return requirementText;
              }
            };
            
            const requirementText = getRequirementText(medal.name, medalLevel);
            
            return (
              <div 
                key={medal.id} 
                className={`medal ${className}`}
                title={requirementText}
              >
                <div className="medal-icon">{icon}</div>
                <div className="medal-name">{medal.name}</div>
                <div className="medal-status">{status}</div>
                {(medalLevel === '大师' || medalLevel === '至尊') && (
                  <div className="medal-effect">
                    <div className="particles">
                      <div className="particle"></div>
                      <div className="particle"></div>
                      <div className="particle"></div>
                      <div className="particle"></div>
                      <div className="particle"></div>
                      <div className="particle"></div>
                      <div className="particle"></div>
                      <div className="particle"></div>
                      <div className="particle"></div>
                      <div className="particle"></div>
                    </div>
                    {medalLevel === '至尊' && (
                      <>
                        <div className="medal-rays"></div>
                        <div className="medal-rays-diagonal"></div>
                        <div className="medal-rays-short"></div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染成绩查询内容
  const renderGrades = () => {
    return (
      <div className="grades-container">
        <GradeQuery />
      </div>
    );
  };

  // 渲染积分管理内容
  const renderPointsManagement = () => {
    return (
      <div className="points-management-wrapper">
        <PointsManagement />
      </div>
    );
  };

  // 渲染积分商城内容
  const renderPointsStore = () => {
    return (
      <div className="points-store-wrapper">
        <PointsStore />
      </div>
    );
  };

  // 根据当前选中的标签渲染对应内容
  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalCenter();
      case 'grades':
        return renderGrades();
      case 'points':
        return renderPointsManagement();
      case 'store':
        return renderPointsStore();
      default:
        return renderPersonalCenter();
    }
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h2>学生信息系统</h2>
      </div>

      <div className="dashboard-container">
        <div className="sidebar">
          <div 
            className={`sidebar-item ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            个人中心
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'grades' ? 'active' : ''}`}
            onClick={() => setActiveTab('grades')}
          >
            成绩查询
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'points' ? 'active' : ''}`}
            onClick={() => setActiveTab('points')}
          >
            积分管理
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            积分商城
          </div>
        </div>

        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;