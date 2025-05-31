/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 22:59:40
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 00:46:16
 * @FilePath: \life_view\src\renderer\App.tsx
 */
import React, { useState } from 'react'
import CounterView from './components/CounterView'

function App(): JSX.Element {
  const [showMVVM, setShowMVVM] = useState(false)
  const [testMessage, setTestMessage] = useState('Electron 正在运行...')

  const handleTestClick = () => {
    setTestMessage('前端功能正常! ✅')
  }

  const handleShowMVVM = () => {
    setShowMVVM(true)
  }

  if (showMVVM) {
    return (
      <div>
        <button
          onClick={() => setShowMVVM(false)}
          style={{ margin: '10px', padding: '10px' }}
        >
          返回测试页面
        </button>
        <CounterView />
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Life View Application</h1>

      <div style={{
        background: '#f0f0f0',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>系统状态</h2>
        <p>状态: {testMessage}</p>
        <button
          onClick={handleTestClick}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          测试前端功能
        </button>

        <button
          onClick={handleShowMVVM}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          启动 MVVM 演示
        </button>
      </div>

      <div style={{
        background: '#e8f5e8',
        padding: '15px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <h3>应用信息</h3>
        <p>• Electron 应用已启动</p>
        <p>• React 前端正常运行</p>
        <p>• 可以切换到MVVM演示查看C++后端集成</p>
      </div>
    </div>
  )
}

export default App
