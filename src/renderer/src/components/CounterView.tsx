import React, { useState } from 'react'
import { useMVVM } from '../hooks/useMVVM'

const CounterView: React.FC = () => {
  const { viewModels, isConnected, executeAction } = useMVVM()
  const [customMessage, setCustomMessage] = useState('')
  const [customNumber, setCustomNumber] = useState('')

  const counterViewModel = viewModels.counter

  if (!isConnected) {
    return <div className="loading">连接MVVM框架中...</div>
  }

  if (!counterViewModel) {
    return <div className="error">计数器ViewModel未找到</div>
  }

  const { properties } = counterViewModel
  const count = properties?.count || 0
  const message = properties?.message || ''
  const isEven = properties?.isEven || false

  const handleIncrement = (): void => {
    executeAction('counter', 'increment')
  }

  const handleDecrement = (): void => {
    executeAction('counter', 'decrement')
  }

  const handleReset = (): void => {
    executeAction('counter', 'reset')
  }

  const handleSetMessage = (): void => {
    if (customMessage.trim()) {
      executeAction('counter', 'setMessage', customMessage)
      setCustomMessage('')
    }
  }

  const handleAddNumber = (): void => {
    const number = parseInt(customNumber)
    if (!isNaN(number)) {
      executeAction('counter', 'addNumber', number)
      setCustomNumber('')
    }
  }

  return (
    <div className="counter-view">
      <h2>MVVM计数器示例</h2>

      {/* 显示状态 */}
      <div className="status-section">
        <div className="status-item">
          <span className="label">计数:</span>
          <span className={`value ${isEven ? 'even' : 'odd'}`}>{count}</span>
        </div>
        <div className="status-item">
          <span className="label">状态:</span>
          <span className="value">{isEven ? '偶数' : '奇数'}</span>
        </div>
        <div className="status-item">
          <span className="label">消息:</span>
          <span className="value message">{message}</span>
        </div>
      </div>

      {/* 基本操作按钮 */}
      <div className="controls-section">
        <h3>基本操作</h3>
        <div className="button-group">
          <button onClick={handleIncrement} className="btn btn-primary">
            增加 (+1)
          </button>
          <button onClick={handleDecrement} className="btn btn-secondary">
            减少 (-1)
          </button>
          <button onClick={handleReset} className="btn btn-warning">
            重置
          </button>
        </div>
      </div>

      {/* 自定义消息 */}
      <div className="controls-section">
        <h3>设置自定义消息</h3>
        <div className="input-group">
          <input
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="输入新消息"
            className="input"
          />
          <button onClick={handleSetMessage} className="btn btn-info">
            设置消息
          </button>
        </div>
      </div>

      {/* 添加自定义数字 */}
      <div className="controls-section">
        <h3>添加自定义数字</h3>
        <div className="input-group">
          <input
            type="number"
            value={customNumber}
            onChange={(e) => setCustomNumber(e.target.value)}
            placeholder="输入要添加的数字"
            className="input"
          />
          <button onClick={handleAddNumber} className="btn btn-success">
            添加数字
          </button>
        </div>
      </div>

      {/* 可用操作列表 */}
      <div className="info-section">
        <h3>可用操作</h3>
        <div className="actions-list">
          {counterViewModel.actions.map((action) => (
            <span key={action} className="action-tag">
              {action}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CounterView
