/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 22:49:53
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-07 14:57:13
 * @FilePath: \life_view\src\renderer\components\MultiInstanceDemo.tsx
 */
import React, { useState } from 'react'
import CounterView from './CounterView'

const MultiInstanceDemo: React.FC = () => {
  const [instanceCount, setInstanceCount] = useState(2)
  const [showInfo, setShowInfo] = useState(true)

  const handleAddInstance = (): void => {
    if (instanceCount < 6) {
      setInstanceCount(instanceCount + 1)
    }
  }

  const handleRemoveInstance = (): void => {
    if (instanceCount > 1) {
      setInstanceCount(instanceCount - 1)
    }
  }

  // 生成实例数组
  const instances = Array.from({ length: instanceCount }, (_, index) => index)

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 标题和控制区域 */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '15px', fontSize: '2.5em' }}>
          🚀 MVVM多实例演示
        </h1>

        {/* 实例控制按钮 */}
        <div
          style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}
        >
          <button
            onClick={handleRemoveInstance}
            disabled={instanceCount <= 1}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: instanceCount <= 1 ? '#d1d5db' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: instanceCount <= 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            移除实例
          </button>

          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#374151'
            }}
          >
            当前实例: {instanceCount}
          </div>

          <button
            onClick={handleAddInstance}
            disabled={instanceCount >= 6}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: instanceCount >= 6 ? '#d1d5db' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: instanceCount >= 6 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            添加实例
          </button>
        </div>

        {/* 架构信息卡片 */}
        {showInfo && (
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowInfo(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 实例网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px',
          alignItems: 'start'
        }}
      >
        {instances.map((index) => (
          <div
            key={index}
            style={{
              border: '2px solid #e5e7eb',
              borderRadius: '16px',
              overflow: 'hidden',
              background: 'white',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s'
            }}
          >
            <div
              style={{
                background: '#f8fafc',
                padding: '15px',
                borderBottom: '1px solid #e5e7eb',
                textAlign: 'center'
              }}
            >
              <h3
                style={{
                  margin: 0,
                  color: '#374151',
                  fontSize: '18px'
                }}
              >
                📱 实例 #{index + 1}
              </h3>
              <p
                style={{
                  margin: '5px 0 0 0',
                  color: '#6b7280',
                  fontSize: '12px'
                }}
              >
                独立的C++ ViewModel实例
              </p>
            </div>
            <CounterView />
          </div>
        ))}
      </div>
    </div>
  )
}

export default MultiInstanceDemo
