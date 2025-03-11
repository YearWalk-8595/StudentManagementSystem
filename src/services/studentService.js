// 学生数据服务
import { useState, useEffect } from 'react';

// 缓存数据
let cachedStudentData = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 缓存有效期5分钟

/**
 * 获取学生数据
 * @returns {Promise<Array>} 学生数据数组
 */
export const fetchStudentData = async () => {
  // 如果缓存有效，直接返回缓存数据
  if (cachedStudentData && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    return cachedStudentData;
  }

  try {
    const response = await fetch(
      "https://api.vika.cn/fusion/v1/datasheets/dstieg0p6KYkgxlteM/records?viewId=viwtkFo928C2U&fieldKey=name",
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
      cachedStudentData = data.data.records;
      lastFetchTime = Date.now();
      return data.data.records;
    } else {
      throw new Error('API返回数据格式不正确');
    }
  } catch (error) {
    console.error('获取学生数据错误:', error);
    throw error;
  }
};

/**
 * 根据学生邮箱查找学生信息
 * @param {string} email 学生邮箱
 * @returns {Promise<Object|null>} 学生信息对象或null
 */
export const findStudentByEmail = async (email) => {
  if (!email) return null;
  
  try {
    const students = await fetchStudentData();
    return students.find(record => {
      const studentEmail = record.fields.students_mail;
      return studentEmail && studentEmail === email;
    }) || null;
  } catch (error) {
    console.error('查找学生信息错误:', error);
    return null;
  }
};

/**
 * 使用学生数据的Hook
 * @param {string} email 学生邮箱
 * @returns {Object} 包含学生数据、加载状态和错误信息的对象
 */
export const useStudentData = (email) => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStudentData = async () => {
      if (!email) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const student = await findStudentByEmail(email);
        setStudentData(student);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadStudentData();
  }, [email]);

  return { studentData, loading, error };
};