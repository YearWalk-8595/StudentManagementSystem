import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useStudentData } from '../services/studentService';
import { fetchProducts, exchangeProduct, createInventoryRecord } from '../services/storeService';
import './PointsStore.css';

function PointsStore() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeQuantities, setExchangeQuantities] = useState({});
  const [exchangeStatus, setExchangeStatus] = useState({ success: false, error: null, productId: null });
  
  const user = auth.currentUser;
  const { studentData } = useStudentData(user?.email);

  // 加载商品列表
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const productsList = await fetchProducts();
        setProducts(productsList);
        
        // 初始化每个商品的兑换数量为1
        const quantities = {};
        productsList.forEach(product => {
          quantities[product.recordId] = 1;
        });
        setExchangeQuantities(quantities);
      } catch (err) {
        console.error('加载商品列表失败:', err);
        setError('加载商品列表失败，请稍后再试');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // 处理兑换数量变更
  const handleQuantityChange = (productId, value) => {
    // 确保数量不小于1且不大于剩余库存
    const product = products.find(p => p.recordId === productId);
    const maxStock = product.fields.剩余库存 || 0;
    
    let newValue = parseInt(value);
    if (isNaN(newValue) || newValue < 1) {
      newValue = 1;
    } else if (newValue > maxStock) {
      newValue = maxStock;
    }
    
    setExchangeQuantities(prev => ({
      ...prev,
      [productId]: newValue
    }));
  };

  // 处理兑换商品
  const handleExchange = async (product) => {
    if (!studentData) {
      setExchangeStatus({
        success: false,
        error: '未找到学生信息',
        productId: product.recordId
      });
      return;
    }
    
    const quantity = exchangeQuantities[product.recordId] || 1;
    const totalCost = quantity * product.fields.商品单价;
    
    // 检查积分是否足够
    if (totalCost > studentData.fields.当前积分) {
      setExchangeStatus({
        success: false,
        error: '积分不足',
        productId: product.recordId
      });
      
      // 3秒后清除错误状态，先添加淡出动画
      setTimeout(() => {
        // 先添加淡出动画类
        const statusElement = document.querySelector(`.product-card:has([data-product-id="${product.recordId}"]) .exchange-status`);
        if (statusElement) {
          statusElement.classList.add('fade-out');
        }
        
        // 0.5秒后（动画结束后）清除状态
        setTimeout(() => {
          setExchangeStatus(prev => ({
            ...prev,
            error: null,
            productId: null
          }));
        }, 500);
      }, 3000);
      
      return;
    }
    
    // 检查库存是否足够
    if (quantity > product.fields.剩余库存) {
      setExchangeStatus({
        success: false,
        error: '库存不足',
        productId: product.recordId
      });
      
      // 3秒后清除错误状态，先添加淡出动画
      setTimeout(() => {
        // 先添加淡出动画类
        const statusElement = document.querySelector(`.product-card:has([data-product-id="${product.recordId}"]) .exchange-status`);
        if (statusElement) {
          statusElement.classList.add('fade-out');
        }
        
        // 0.5秒后（动画结束后）清除状态
        setTimeout(() => {
          setExchangeStatus(prev => ({
            ...prev,
            error: null,
            productId: null
          }));
        }, 500);
      }, 3000);
      
      return;
    }
    
    try {
      // 创建积分流水记录
      const reason = `兑换"${product.fields.商品名称}"${quantity}件，消耗${totalCost}积分`;
      await exchangeProduct(
        studentData.fields.学号,
        totalCost,
        reason
      );
      
      // 创建库存流水记录
      await createInventoryRecord(
        product.fields.商品名称,
        quantity,
        '兑换消耗',
        studentData.fields.姓名
      );
      
      // 更新商品列表中的库存
      setProducts(prevProducts => {
        return prevProducts.map(p => {
          if (p.recordId === product.recordId) {
            return {
              ...p,
              fields: {
                ...p.fields,
                剩余库存: p.fields.剩余库存 - quantity
              }
            };
          }
          return p;
        });
      });
      
      // 设置兑换成功状态
      setExchangeStatus({
        success: true,
        error: null,
        productId: product.recordId
      });
      
      // 3秒后清除成功状态
      setTimeout(() => {
        setExchangeStatus(prev => ({
          ...prev,
          success: false,
          productId: null
        }));
      }, 3000);
      
    } catch (err) {
      console.error('兑换商品失败:', err);
      setExchangeStatus({
        success: false,
        error: err.message || '兑换失败，请稍后再试',
        productId: product.recordId
      });
    }
  };

  // 获取商品类型对应的样式类名
  const getProductTypeClass = (type) => {
    switch (type) {
      case '学习文创':
        return 'product-type-study';
      case '实物奖励':
        return 'product-type-physical';
      case '现金奖励':
        return 'product-type-cash';
      case '其他奖励':
      default:
        return 'product-type-other';
    }
  };

  return (
    <div className="points-store-container">
      <div className="store-header">
        <h3>积分商城</h3>
        <div className="user-points">
          <span>当前积分: </span>
          <span className="points-value">{studentData?.fields.当前积分 || 0}</span>
        </div>
      </div>

      {loading && <div className="loading">加载商品中...</div>}
      
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && products.length === 0 && (
        <div className="no-products">暂无商品</div>
      )}
      
      {!loading && !error && products.length > 0 && (
        <div className="products-grid">
          {products.map(product => {
            const isOutOfStock = product.fields.上架状态 === '已下架' || product.fields.剩余库存 <= 0;
            const productTypeClass = getProductTypeClass(product.fields.商品类型);
            const isLowStock = product.fields.上架状态 === '上架中' && 
                              product.fields.剩余库存 > 0 && 
                              product.fields.最大库存 > 0 && 
                              (product.fields.剩余库存 / product.fields.最大库存) <= 0.2;
            
            return (
              <div 
                key={product.recordId} 
                className={`product-card ${isOutOfStock ? 'product-disabled' : ''}`}
              >
                <div className="product-image">
                  {product.fields.商品ID号 ? (
                    <img 
                      src={`/src/ico/${product.fields.商品ID号}.png`} 
                      alt={product.fields.商品名称} 
                    />
                  ) : (
                    <div className="no-image">暂无图片</div>
                  )}
                  {isLowStock && (
                    <div className="low-stock-badge">库存紧张</div>
                  )}
                </div>
                
                <div className="product-info">
                  <h4 className="product-name">{product.fields.商品名称}</h4>
                  
                  <div className="product-meta">
                    <span className={`product-type ${productTypeClass}`}>
                      {product.fields.商品类型}
                    </span>
                    <span className="product-price">{product.fields.商品单价} 积分</span>
                  </div>
                  
                  <div className="product-stock">
                    库存: {product.fields.剩余库存}/{product.fields.最大库存}
                  </div>
                  
                  {product.fields.上架状态 === '已下架' && (
                    <div className="product-status">已下架</div>
                  )}
                </div>
                
                <div className="product-actions">
                  <div className="quantity-control">
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(
                        product.recordId, 
                        (exchangeQuantities[product.recordId] || 1) - 1
                      )}
                      disabled={isOutOfStock || (exchangeQuantities[product.recordId] || 1) <= 1}
                    >
                      -
                    </button>
                    
                    <input 
                      type="number" 
                      min="1" 
                      max={product.fields.剩余库存}
                      value={exchangeQuantities[product.recordId] || 1}
                      onChange={(e) => handleQuantityChange(product.recordId, e.target.value)}
                      disabled={isOutOfStock}
                    />
                    
                    <button 
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(
                        product.recordId, 
                        (exchangeQuantities[product.recordId] || 1) + 1
                      )}
                      disabled={isOutOfStock || (exchangeQuantities[product.recordId] || 1) >= product.fields.剩余库存}
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    className="exchange-btn"
                    onClick={() => handleExchange(product)}
                    disabled={isOutOfStock}
                    data-product-id={product.recordId}
                  >
                    兑换
                  </button>
                </div>
                
                {/* 兑换状态提示 */}
                {exchangeStatus.productId === product.recordId && (
                  <div className={`exchange-status ${exchangeStatus.success ? 'success' : 'error'}`}>
                    {exchangeStatus.success ? '兑换成功！' : exchangeStatus.error}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default PointsStore;