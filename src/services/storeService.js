// 商城服务相关功能

// 获取商品列表
export const fetchProducts = async () => {
  try {
    const response = await fetch(
      `https://api.vika.cn/fusion/v1/datasheets/dstxXvs8QPgwpBnrmZ/records?viewId=viwbYkqXRbdTU&fieldKey=name`,
      {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer uskM2yWWUiRHg8Opq093FD1',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`获取商品列表失败: ${response.status}`);
    }

    const data = await response.json();
    return data.data.records;
  } catch (error) {
    console.error('获取商品列表失败:', error);
    throw error;
  }
};

// 创建积分兑换记录
export const exchangeProduct = async (studentId, amount, reason) => {
  try {
    // 验证兑换金额是否为正数
    if (amount <= 0) {
      throw new Error('兑换金额必须大于0');
    }

    // 创建积分流水记录
    const records = [
      {
        fields: {
          学号: parseInt(studentId),
          积分变化量: amount,
          增减: "减少",
          理由: reason,
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
      throw new Error(`积分兑换记录创建失败: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('积分兑换记录创建失败:', error);
    throw error;
  }
};

// 创建商品库存流水记录
export const createInventoryRecord = async (productName, quantity, changeType, operator) => {
  try {
    // 验证数量是否为正数
    if (quantity <= 0) {
      throw new Error('变更数量必须大于0');
    }

    // 创建库存流水记录
    const records = [
      {
        fields: {
          商品名称: productName,
          变化数目: quantity,
          变化方式: changeType,
          操作用户: operator
        }
      }
    ];

    const response = await fetch(
      `https://api.vika.cn/fusion/v1/datasheets/dstTHQ96njwQ845Al5/records?viewId=viwehq9K5L9Zc&fieldKey=name`,
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
      throw new Error(`库存流水记录创建失败: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('库存流水记录创建失败:', error);
    throw error;
  }
};