// 积分服务相关功能

// 获取学生积分流水记录
export const fetchPointsHistory = async (studentId) => {
  try {
    const response = await fetch(
      `https://api.vika.cn/fusion/v1/datasheets/dstKt8QE0uW89cNFlb/records?viewId=viwwhcDTkvAVC&fieldKey=name`,
      {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer uskM2yWWUiRHg8Opq093FD1',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`获取积分流水失败: ${response.status}`);
    }

    const data = await response.json();
    
    // 过滤出当前学生的积分记录
    const studentRecords = data.data.records.filter(record => 
      record.fields.学号 === parseInt(studentId)
    );

    // 按流水时间倒序排序
    studentRecords.sort((a, b) => {
      const timeA = a.fields.流水时间 || a.createdAt;
      const timeB = b.fields.流水时间 || b.createdAt;
      return timeB - timeA;
    });

    return studentRecords;
  } catch (error) {
    console.error('获取积分流水记录失败:', error);
    throw error;
  }
};

// 获取所有学生列表（用于积分转账功能）
export const fetchAllStudents = async () => {
  try {
    const response = await fetch(
      `https://api.vika.cn/fusion/v1/datasheets/dstieg0p6KYkgxlteM/records?viewId=viwtkFo928C2U&fieldKey=name`,
      {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer uskM2yWWUiRHg8Opq093FD1',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`获取学生列表失败: ${response.status}`);
    }

    const data = await response.json();
    return data.data.records;
  } catch (error) {
    console.error('获取学生列表失败:', error);
    throw error;
  }
};

// 执行积分转账
export const transferPoints = async (fromStudentId, toStudentId, amount, reason) => {
  try {
    // 验证转账金额是否为正数
    if (amount <= 0) {
      throw new Error('转账金额必须大于0');
    }

    // 创建两条记录：一条是转出记录，一条是转入记录
    const records = [
      {
        fields: {
          学号: parseInt(fromStudentId),
          积分变化量: amount,
          增减: "减少",
          理由: `转账给他人: ${reason}`,
          审批状态: "待审核"
        }
      },
      {
        fields: {
          学号: parseInt(toStudentId),
          积分变化量: amount,
          增减: "增加",
          理由: `收到积分: ${reason}`,
          审批状态: "待审核"
        }
      }
    ];

    const response = await fetch(
      `https://api.vika.cn/fusion/v1/datasheets/dstKt8QE0uW89cNFlb/records?viewId=viwwhcDTkvAVC&fieldKey=name`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer uskM2yWWUiRHg8Opq093FD1',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records, fieldKey: "name" })
      }
    );

    if (!response.ok) {
      throw new Error(`积分转账失败: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('积分转账失败:', error);
    throw error;
  }
};