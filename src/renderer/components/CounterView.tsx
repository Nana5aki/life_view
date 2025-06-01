import React, { useEffect, useState } from 'react'
import { useMVVM } from '../hooks/useMVVM'

/**
 * 计数器演示组件 - 展示MVVM模式在React中的应用
 *
 * 该组件连接到C++后端的CounterViewModel，实现：
 * - 双向数据绑定
 * - 操作执行（包括带参数的操作）
 * - 实时状态更新
 */
const CounterView: React.FC = () => {
  const { instanceId, viewId, isReady, executeAction, getProp, onPropertyChange } =
    useMVVM('counter')

  // 本地状态
  const [customValue, setCustomValue] = useState(5)

  // 属性状态
  const [count, setCount] = useState<number>(0)
  const [message, setMessage] = useState<string>('Loading...')
  const [isEven, setIsEven] = useState<boolean>(false)

  /**
   * 当ViewModel准备就绪时，设置属性监听器并获取初始值
   */
  useEffect(() => {
    if (!isReady) return

    // 设置属性变化监听器
    const unsubscribers = [
      onPropertyChange('count', (value) => setCount(value as number)),
      onPropertyChange('message', (value) => setMessage(value as string)),
      onPropertyChange('isEven', (value) => setIsEven(value as boolean))
    ]

    // 获取初始属性值
    const loadInitialValues = async (): Promise<void> => {
      const [initialCount, initialMessage, initialIsEven] = await Promise.all([
        getProp('count'),
        getProp('message'),
        getProp('isEven')
      ])

      setCount((initialCount as number) || 0)
      setMessage((initialMessage as string) || 'Ready')
      setIsEven((initialIsEven as boolean) || false)
    }

    loadInitialValues()

    // 清理监听器
    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [isReady, onPropertyChange, getProp])

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

  // 如果ViewModel未准备好，显示简单提示
  if (!isReady) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>正在初始化...</h2>
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
      <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '30px' }}>
        🚀 MVVM计数器演示
      </h1>

      {/* ViewModel信息卡片 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h3 style={{ margin: '0 0 15px 0' }}>📋 ViewModel信息</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '10px',
            fontSize: '14px'
          }}
        >
          <span>
            <strong>实例ID:</strong>
          </span>
          <span style={{ fontFamily: 'monospace' }}>{instanceId}</span>
          <span>
            <strong>视图ID:</strong>
          </span>
          <span style={{ fontFamily: 'monospace' }}>{viewId}</span>
          <span>
            <strong>状态:</strong>
          </span>
          <span>✅ 已连接并就绪</span>
          <span>
            <strong>后端:</strong>
          </span>
          <span>C++ MVVM Framework (优化版)</span>
        </div>
      </div>

      {/* 计数器显示区域 */}
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
        <p style={{ margin: '0', fontSize: '16px', opacity: 0.9 }}>{message}</p>
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

      {/* 技术说明 */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px'
        }}
      >
        <h3 style={{ margin: '0 0 15px 0', color: '#475569' }}>🔧 技术特性 (优化版)</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.6' }}>
          <li>
            <strong>多实例支持:</strong> 每个useMVVM调用创建独立的ViewModel实例
          </li>
          <li>
            <strong>按需获取:</strong> 属性值通过IPC按需获取，减少内存占用
          </li>
          <li>
            <strong>事件驱动:</strong> 使用onPropertyChange API简化属性监听
          </li>
          <li>
            <strong>自动清理:</strong> 组件卸载时自动清理监听器和实例
          </li>
          <li>
            <strong>错误处理:</strong> 完善的错误处理和用户反馈
          </li>
          <li>
            <strong>类型安全:</strong> 完整的TypeScript类型定义
          </li>
        </ul>
      </div>
    </div>
  )
}

export default CounterView
