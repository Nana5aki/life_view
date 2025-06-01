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
  const { 
    isReady, 
    error, 
    properties, 
    viewId, 
    addPropertyListener, 
    executeAction, 
    getProp,
    refresh 
  } = useMVVM('counter')

  // 本地状态用于UI反馈
  const [loading, setLoading] = useState<string | null>(null)
  const [customValue, setCustomValue] = useState(5)
  const [actionError, setActionError] = useState<string | null>(null)

  /**
   * 当ViewModel准备就绪时，设置属性监听器
   */
  useEffect(() => {
    if (isReady) {
      console.log('设置属性监听器...')
      
      // 监听所有计数器相关属性
      const setupListeners = async () => {
        await Promise.all([
          addPropertyListener('count'),
          addPropertyListener('message'), 
          addPropertyListener('isEven')
        ])
        console.log('所有属性监听器设置完成')
      }
      
      setupListeners().catch(err => {
        console.error('设置监听器失败:', err)
      })
    }
  }, [isReady, addPropertyListener])

  /**
   * 执行操作的通用处理函数
   */
  const handleAction = async (actionName: string, ...args: unknown[]) => {
    setLoading(actionName)
    setActionError(null)
    
    try {
      await executeAction(actionName, ...args)
      console.log(`操作 ${actionName} 执行成功`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `操作 ${actionName} 失败`
      console.error(`操作 ${actionName} 失败:`, err)
      setActionError(errorMessage)
    } finally {
      setLoading(null)
    }
  }

  // 各种操作处理函数
  const handleIncrement = () => handleAction('increment')
  const handleDecrement = () => handleAction('decrement') 
  const handleReset = () => handleAction('reset')
  const handleAddCustom = () => handleAction('addNumber', customValue)

  // 错误状态显示
  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          background: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '8px',
          padding: '20px',
          color: '#c62828'
        }}>
          <h2>❌ ViewModel错误</h2>
          <p><strong>错误信息：</strong>{error}</p>
          <p><strong>可能原因：</strong></p>
          <ul>
            <li>C++后端模块未正确编译或加载</li>
            <li>ViewModel类型 'counter' 未注册</li>
            <li>Node.js原生模块路径错误</li>
          </ul>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            重新加载页面
          </button>
        </div>
      </div>
    )
  }

  // 加载状态显示
  if (!isReady) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          background: '#f3f4f6',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2>🔄 正在初始化ViewModel...</h2>
          <p>正在连接到C++后端...</p>
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // 获取当前属性值
  const count = getProp('count') as number ?? 0
  const message = getProp('message') as string ?? 'Loading...'
  const isEven = getProp('isEven') as boolean ?? false

  return (
    <div style={{ padding: '20px', maxWidth: '700px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#1f2937', marginBottom: '30px' }}>
        🚀 MVVM计数器演示
      </h1>

      {/* ViewModel信息卡片 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>📋 ViewModel信息</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px', fontSize: '14px' }}>
          <span><strong>视图ID:</strong></span>
          <span style={{ fontFamily: 'monospace' }}>{viewId}</span>
          <span><strong>状态:</strong></span>
          <span>✅ 已连接并就绪</span>
          <span><strong>后端:</strong></span>
          <span>C++ MVVM Framework (完整版)</span>
        </div>
      </div>

      {/* 计数器显示区域 */}
      <div style={{
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '16px',
        textAlign: 'center',
        marginBottom: '20px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '3em' }}>{count}</h2>
        <p style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
          当前值 {isEven ? '是' : '不是'} 偶数
        </p>
        <p style={{ margin: '0', fontSize: '16px', opacity: 0.9 }}>
          {message}
        </p>
      </div>

      {/* 错误提示 */}
      {actionError && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          color: '#dc2626'
        }}>
          <h4 style={{ margin: '0 0 5px 0' }}>⚠️ 操作错误</h4>
          <p style={{ margin: 0, fontSize: '14px' }}>{actionError}</p>
        </div>
      )}

      {/* 操作按钮区域 */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>🎮 操作控制</h3>
        
        {/* 基础操作 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <button
            onClick={handleIncrement}
            disabled={!!loading}
            style={{
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: loading === 'increment' ? '#93c5fd' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading === 'increment' ? '⏳' : '+'} 增加
          </button>
          
          <button
            onClick={handleDecrement}
            disabled={!!loading}
            style={{
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: loading === 'decrement' ? '#fca5a5' : '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading === 'decrement' ? '⏳' : '-'} 减少
          </button>
          
          <button
            onClick={handleReset}
            disabled={!!loading}
            style={{
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: loading === 'reset' ? '#a1a1aa' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading === 'reset' ? '⏳' : '🔄'} 重置
          </button>
        </div>

        {/* 自定义数值操作 - 现在应该可以工作了 */}
        <div style={{
          padding: '15px',
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #22c55e'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#166534' }}>➕ 添加自定义数值</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="number"
              value={customValue}
              onChange={(e) => setCustomValue(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '16px',
                width: '100px'
              }}
            />
            <button
              onClick={handleAddCustom}
              disabled={!!loading}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: loading === 'addNumber' ? '#a78bfa' : '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading === 'addNumber' ? '⏳ 处理中...' : '✅ 添加'}
            </button>
          </div>
        </div>
      </div>

      {/* 状态指示 */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #0ea5e9',
        borderRadius: '8px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#0c4a6e' }}>📊 系统状态</h4>
        <div style={{ fontSize: '14px', color: '#075985' }}>
          <div style={{ display: 'grid', gap: '5px' }}>
            <div>✅ <strong>基础操作:</strong> 完全支持 (increment, decrement, reset)</div>
            <div>✅ <strong>参数操作:</strong> 完全支持 (addNumber)</div>
            <div>✅ <strong>属性监听:</strong> 实时更新</div>
            <div>✅ <strong>双向绑定:</strong> 状态同步</div>
          </div>
        </div>
      </div>

      {/* 调试信息区域 */}
      <details style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '15px'
      }}>
        <summary style={{
          cursor: 'pointer',
          fontWeight: 'bold',
          color: '#475569',
          marginBottom: '10px'
        }}>
          🔍 调试信息 (点击展开)
        </summary>
        
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <h4>属性状态:</h4>
          <pre style={{
            background: '#1e293b',
            color: '#e2e8f0',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(properties, null, 2)}
          </pre>
          
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
            <button
              onClick={refresh}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 刷新状态
            </button>
          </div>
        </div>
      </details>
    </div>
  )
}

export default CounterView
