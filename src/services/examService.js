// 考试数据服务
import { useState, useEffect } from 'react';

// 缓存数据
let cachedExamData = null;
let cachedStudentGradeData = null;
let lastFetchExamTime = null;
let lastFetchGradeTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 缓存有效期5分钟

/**
 * 获取考试信息数据
 * @returns {Promise<Array>} 考试信息数据数组
 */
export const fetchExamData = async () => {
  // 如果缓存有效，直接返回缓存数据
  if (cachedExamData && lastFetchExamTime && (Date.now() - lastFetchExamTime < CACHE_DURATION)) {
    return cachedExamData;
  }

  try {
    const response = await fetch(
      "https://api.vika.cn/fusion/v1/datasheets/dstcvSavR3aMxLBaKQ/records?viewId=viwp2RPN8zzXc&fieldKey=name",
      {
        headers: {
          "Authorization": "Bearer uskM2yWWUiRHg8Opq093FD1"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.data && data.data.records) {
      // 更新缓存
      cachedExamData = data.data.records;
      lastFetchExamTime = Date.now();
      return data.data.records;
    } else {
      throw new Error('API返回数据格式不正确');
    }
  } catch (error) {
    console.error('获取考试数据错误:', error);
    throw error;
  }
};

/**
 * 获取学生成绩数据
 * @returns {Promise<Array>} 学生成绩数据数组
 */
export const fetchStudentGradeData = async () => {
  // 如果缓存有效，直接返回缓存数据
  if (cachedStudentGradeData && lastFetchGradeTime && (Date.now() - lastFetchGradeTime < CACHE_DURATION)) {
    return cachedStudentGradeData;
  }

  try {
    const response = await fetch(
      "https://api.vika.cn/fusion/v1/datasheets/dstireEJij3DrLVJhy/records?viewId=viwxh1AQ8uNHA&fieldKey=name",
      {
        headers: {
          "Authorization": "Bearer uskM2yWWUiRHg8Opq093FD1"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.data && data.data.records) {
      // 更新缓存
      cachedStudentGradeData = data.data.records;
      lastFetchGradeTime = Date.now();
      return data.data.records;
    } else {
      throw new Error('API返回数据格式不正确');
    }
  } catch (error) {
    console.error('获取学生成绩数据错误:', error);
    throw error;
  }
};

/**
 * 根据学生邮箱获取该学生的所有成绩
 * @param {string} studentName 学生姓名
 * @returns {Promise<Array>} 学生成绩数组
 */
export const getStudentGradesByName = async (studentName) => {
  if (!studentName) return [];
  
  try {
    const grades = await fetchStudentGradeData();
    return grades.filter(record => record.fields.姓名 === studentName) || [];
  } catch (error) {
    console.error('获取学生成绩错误:', error);
    return [];
  }
};

/**
 * 使用考试数据的Hook
 * @returns {Object} 包含考试数据、加载状态和错误信息的对象
 */
export const useExamData = () => {
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadExamData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchExamData();
        // 按考试日期降序排序（最近的考试在前）
        const sortedData = [...data].sort((a, b) => {
          const dateA = a.fields.考试日期 || 0;
          const dateB = b.fields.考试日期 || 0;
          return dateB - dateA;
        });
        setExamData(sortedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadExamData();
  }, []);

  return { examData, loading, error };
};

/**
 * 使用学生成绩数据的Hook
 * @param {string} studentName 学生姓名
 * @returns {Object} 包含学生成绩数据、加载状态和错误信息的对象
 */
export const useStudentGrades = (studentName) => {
  const [gradeData, setGradeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGradeData = async () => {
      if (!studentName) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const grades = await getStudentGradesByName(studentName);
        setGradeData(grades);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadGradeData();
  }, [studentName]);

  return { gradeData, loading, error };
};