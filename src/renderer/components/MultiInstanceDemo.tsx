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
  const { instanceId, viewId, isReady, error, executeAction, getProp, onPropertyChange } =
    useMVVM('counter')

  const [count, setCount] = useState<number>(0)
  const [message, setMessage] = useState<string>('Loading...')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
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

        setCount((initialCount as number) || 0)
        setMessage((initialMessage as string) || 'Ready')
      } catch {
        // 静默处理错误
      }
    }

    loadInitialValues()

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [isReady, onPropertyChange, getProp])

  const handleIncrement = async (): Promise<void> => {
    setLoading(true)
    try {
      await executeAction('increment')
    } catch {
      // 静默处理错误
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (): Promise<void> => {
    setLoading(true)
    try {
      await executeAction('reset')
    } catch {
      // 静默处理错误
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        border: `2px solid ${color}`,
        borderRadius: '8px',
        padding: '20px',
        background: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <h3 style={{ color, margin: '0 0 15px 0' }}>{title}</h3>

      <div style={{ marginBottom: '15px', fontSize: '12px', color: '#6b7280' }}>
        <div>实例ID: {instanceId}</div>
        <div>视图ID: {viewId}</div>
      </div>

      <div
        style={{
          background: color,
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '15px'
        }}
      >
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

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}
      >
        <CounterInstance title="计数器 A" color="#3b82f6" />
        <CounterInstance title="计数器 B" color="#ef4444" />
        <CounterInstance title="计数器 C" color="#10b981" />
        <CounterInstance title="计数器 D" color="#f59e0b" />
      </div>
    </div>
  )
}

export default MultiInstanceDemo
