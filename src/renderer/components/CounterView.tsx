import React, { useEffect, useState } from 'react'
import { useMVVM } from '../hooks/useMVVM'

const CounterView: React.FC = () => {
  const { executeAction, getProp, onPropertyChange } = useMVVM('counter')

  // 本地状态
  const [customValue, setCustomValue] = useState(5)

  // 属性状态
  const [count, setCount] = useState<number>(0)
  const [isEven, setIsEven] = useState<boolean>(false)

  useEffect(() => {
    // 设置属性变化监听器
    const unsubscribers = [
      onPropertyChange('count', (value) => setCount(value as number)),
      onPropertyChange('isEven', (value) => setIsEven(value as boolean))
    ]

    // 获取初始属性值
    const loadInitialValues = async (): Promise<void> => {
      const [initialCount, initialIsEven] = await Promise.all([getProp('count'), getProp('isEven')])

      setCount((initialCount as number) || 0)
      setIsEven((initialIsEven as boolean) || false)
    }

    loadInitialValues()

    // 清理监听器
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [onPropertyChange, getProp])

  // 各种操作处理函数
  const handleIncrement = (): void => {
    executeAction('increment')
  }
  const handleDecrement = (): void => {
    executeAction('decrement')
  }
  const handleReset = (): void => {
    executeAction('reset')
  }
  const handleAddCustom = (): void => {
    executeAction('addNumber', customValue)
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
          >
            🔄 重置
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
          >
            ➕ 添加
          </button>
        </div>
      </div>
    </div>
  )
}

export default CounterView
