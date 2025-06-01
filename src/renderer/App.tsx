/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 22:59:40
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 00:46:16
 * @FilePath: \life_view\src\renderer\App.tsx
 */
import React, { useState } from 'react'
import CounterView from './components/CounterView'

/**
 * 主应用组件
 * 
 * 提供应用导航和功能切换界面
 */
function App(): JSX.Element {
  const [currentView, setCurrentView] = useState<'home' | 'mvvm'>('home')
  const [systemStatus, setSystemStatus] = useState('Electron 正在运行...')

  /**
   * 测试前端功能
   */
  const handleTestFrontend = () => {
    setSystemStatus('前端功能测试通过! ✅')
    setTimeout(() => {
      setSystemStatus('系统运行正常 🚀')
    }, 3000)
  }

  /**
   * 切换到MVVM演示
   */
  const handleShowMVVM = () => {
    setCurrentView('mvvm')
  }

  /**
   * 返回主页
   */
  const handleBackToHome = () => {
    setCurrentView('home')
  }

  // MVVM演示页面
  if (currentView === 'mvvm') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        {/* 顶部导航栏 */}
        <nav style={{
          background: 'white',
          padding: '15px 20px',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#1f2937' }}>Life View - MVVM演示</h2>
            <button
              onClick={handleBackToHome}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← 返回主页
            </button>
          </div>
        </nav>
        
        {/* MVVM演示内容 */}
        <main>
          <CounterView />
        </main>
      </div>
    )
  }

  // 主页
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '600px',
        width: '90%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            margin: '0 0 10px 0',
            fontSize: '2.5em',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Life View
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '18px' }}>
            Electron + React + C++ MVVM 框架
          </p>
        </div>

        {/* 系统状态卡片 */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#0c4a6e' }}>📊 系统状态</h3>
          <p style={{
            margin: '0 0 15px 0',
            fontSize: '16px',
            color: '#075985'
          }}>
            状态: {systemStatus}
          </p>
          
          <button
            onClick={handleTestFrontend}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginRight: '10px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
          >
            🧪 测试前端功能
          </button>

          <button
            onClick={handleShowMVVM}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
          >
            🚀 启动 MVVM 演示
          </button>
        </div>

        {/* 应用特性展示 */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #22c55e',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#14532d' }}>✨ 应用特性</h3>
          <div style={{ fontSize: '14px', color: '#166534', lineHeight: '1.6' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <div>• 🖥️ Electron 跨平台桌面应用</div>
              <div>• ⚛️ React 现代化前端界面</div>
              <div>• 🔧 C++ 高性能后端处理</div>
              <div>• 🔄 MVVM 架构模式实现</div>
              <div>• 📡 IPC 进程间通信</div>
              <div>• 📦 TypeScript 类型安全</div>
            </div>
          </div>
        </div>

        {/* 版本信息 */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f8fafc',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#64748b',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0 }}>
            Version 1.0.0 | Built with ❤️ | 
            <a 
              href="#" 
              style={{ color: '#3b82f6', textDecoration: 'none', marginLeft: '5px' }}
            >
              查看文档
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
