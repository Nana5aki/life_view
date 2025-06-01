import React, { useEffect, useState } from 'react'
import { useMVVM } from '../hooks/useMVVM'

/**
 * 单个计数器实例组件
 */
interface CounterInstanceProps {
  title: string
  color: string
}

const CounterInstance: React.FC<CounterInstanceProps> = ({ title, color }) => {
  const { 
    instanceId,
    viewId,
    isReady, 
    error, 
    executeAction, 
    getProp,
    onPropertyChange
  } = useMVVM('counter')

  const [count, setCount] = useState<number>(0)
  const [message, setMessage] = useState<string>('Loading...')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isReady) return
    
    const unsubscribers = [
      onPropertyChange('count', (value) => setCount(value as number)),
      onPropertyChange('message', (value) => setMessage(value as string))
    ]
    
    const loadInitialValues = async (): Promise<void> => {
      try {
        const [initialCount, initialMessage] = await Promise.all([
          getProp('count'),
          getProp('message')
        ])
        
        setCount(initialCount as number || 0)
        setMessage(initialMessage as string || 'Ready')
      } catch (err) {
        // 静默处理错误
      }
    }
    
    loadInitialValues()
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }, [isReady, onPropertyChange, getProp])

  const handleIncrement = async (): Promise<void> => {
    setLoading(true)
    try {
      await executeAction('increment')
    } catch (err) {
      // 静默处理错误
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (): Promise<void> => {
    setLoading(true)
    try {
      await executeAction('reset')
    } catch (err) {
      // 静默处理错误
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div style={{
        border: '2px solid #ef4444',
        borderRadius: '8px',
        padding: '20px',
        background: '#fef2f2',
        color: '#dc2626'
      }}>
        <h3>{title}</h3>
        <p>错误: {error}</p>
      </div>
    )
  }

  if (!isReady) {
    return (
      <div style={{
        border: '2px solid #6b7280',
        borderRadius: '8px',
        padding: '20px',
        background: '#f9fafb',
        textAlign: 'center'
      }}>
        <h3>{title}</h3>
        <p>正在初始化...</p>
      </div>
    )
  }

  return (
    <div style={{
      border: `2px solid ${color}`,
      borderRadius: '8px',
      padding: '20px',
      background: 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ color, margin: '0 0 15px 0' }}>{title}</h3>
      
      <div style={{ marginBottom: '15px', fontSize: '12px', color: '#6b7280' }}>
        <div>实例ID: {instanceId}</div>
        <div>视图ID: {viewId}</div>
      </div>
      
      <div style={{
        background: color,
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        marginBottom: '15px'
      }}>
        <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{count}</div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>{message}</div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleIncrement}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: loading ? '#d1d5db' : color,
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳' : '+'} 增加
        </button>
        
        <button
          onClick={handleReset}
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: loading ? '#d1d5db' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '⏳' : '🔄'} 重置
        </button>
      </div>
    </div>
  )
}

/**
 * 多实例演示组件
 */
const MultiInstanceDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '30px' }}>
        🚀 MVVM多实例演示
      </h1>
      
      <div style={{
        background: '#e0f2fe',
        border: '1px solid #0891b2',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#164e63' }}>📋 多实例特性</h3>
        <ul style={{ margin: 0, color: '#155e75' }}>
          <li>每个计数器都是独立的ViewModel实例</li>
          <li>实例之间互不干扰，拥有独立的状态</li>
          <li>同时支持多个实例并发操作</li>
          <li>每个实例有唯一的instanceId和viewId</li>
        </ul>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <CounterInstance title="计数器 A" color="#3b82f6" />
        <CounterInstance title="计数器 B" color="#ef4444" />
        <CounterInstance title="计数器 C" color="#10b981" />
        <CounterInstance title="计数器 D" color="#f59e0b" />
      </div>
      
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '30px'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#475569' }}>🔧 技术实现</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.6' }}>
          <li><strong>独立实例:</strong> 每个计数器调用useMVVM创建独立的C++实例</li>
          <li><strong>实例管理:</strong> 主进程维护Map&lt;instanceId, ViewModel&gt;映射</li>
          <li><strong>事件隔离:</strong> 属性变化事件通过instanceId进行路由</li>
          <li><strong>内存管理:</strong> 组件卸载时自动清理对应的C++实例</li>
          <li><strong>并发安全:</strong> 多实例并发操作互不影响</li>
        </ul>
      </div>
    </div>
  )
}

export default MultiInstanceDemo 