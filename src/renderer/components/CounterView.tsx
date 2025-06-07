/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 22:27:18
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-07 14:56:57
 * @FilePath: \life_view\src\renderer\components\CounterView.tsx
 */
import React, { useEffect, useState } from 'react'
import { useMVVM } from '../hooks/useMVVM'

const CounterView: React.FC = () => {
  const { executeAction, getProp, onPropertyChange } = useMVVM('counter')

  // 本地状态
  const [customValue, setCustomValue] = useState(5)
  const [isInitialized, setIsInitialized] = useState(false)

  // 属性状态
  const [count, setCount] = useState<number>(0)
  const [isEven, setIsEven] = useState<boolean>(false)

  useEffect(() => {
    // 设置属性变化监听器
    const unsubscribers = [
      onPropertyChange('count', (value) => {
        setCount(value as number)
      }),
      onPropertyChange('isEven', (value) => {
        setIsEven(value as boolean)
      })
    ]

    // 延迟初始化，确保ViewModel已经创建
    const initTimer = setTimeout(() => {
      try {
        // 获取初始属性值 - 直接同步调用
        const initialCount = getProp('count') as number
        const initialIsEven = getProp('isEven') as boolean
        setCount(initialCount || 0)
        setIsEven(initialIsEven || false)
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to load initial values:', error)
        // 设置默认值
        setCount(0)
        setIsEven(true)
        setIsInitialized(true)
      }
    }, 100)

    // 清理函数
    return () => {
      clearTimeout(initTimer)
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [onPropertyChange, getProp])

  // 各种操作处理函数
  const handleIncrement = (): void => {
    try {
      executeAction('increment')
    } catch (error) {
      console.error('Failed to increment:', error)
    }
  }

  const handleDecrement = (): void => {
    try {
      executeAction('decrement')
    } catch (error) {
      console.error('Failed to decrement:', error)
    }
  }

  const handleReset = (): void => {
    try {
      executeAction('reset')
    } catch (error) {
      console.error('Failed to reset:', error)
    }
  }

  const handleAddCustom = (): void => {
    try {
      executeAction('addNumber', customValue)
    } catch (error) {
      console.error('Failed to add custom value:', error)
    }
  }

  // 显示加载状态
  if (!isInitialized) {
    return (
      <div
        style={{
          padding: '20px',
          maxWidth: '700px',
          margin: '0 auto',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            background: '#f3f4f6',
            borderRadius: '12px',
            padding: '40px',
            color: '#6b7280'
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>🔄</div>
          <p>正在初始化ViewModel...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '700px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '16px',
          textAlign: 'center',
          marginBottom: '20px',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h2 style={{ margin: '0 0 10px 0', fontSize: '3em' }}>{count}</h2>
        <p style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
          当前值 {isEven ? '是' : '不是'} 偶数
        </p>
      </div>

      {/* 操作按钮区域 */}
      <div
        style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}
      >
        <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>🎮 操作控制</h3>

        {/* 基础操作 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '10px',
            marginBottom: '20px'
          }}
        >
          <button
            onClick={handleIncrement}
            style={{
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6'
            }}
          >
            + 增加
          </button>

          <button
            onClick={handleDecrement}
            style={{
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444'
            }}
          >
            - 减少
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#6b7280'
            }}
          >
            重置
          </button>
        </div>

        {/* 自定义数值操作 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '15px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}
        >
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
            添加数值:
          </label>
          <input
            type="number"
            value={customValue}
            onChange={(e) => setCustomValue(parseInt(e.target.value) || 0)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              width: '80px'
            }}
          />
          <button
            onClick={handleAddCustom}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#7c3aed'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#8b5cf6'
            }}
          >
            添加
          </button>
        </div>
      </div>
    </div>
  )
}

export default CounterView
