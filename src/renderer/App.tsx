/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 22:59:40
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 00:46:16
 * @FilePath: \life_view\src\renderer\App.tsx
 */
import React, { useState } from 'react'
import CounterView from './components/CounterView'
import MultiInstanceDemo from './components/MultiInstanceDemo'

/**
 * 主应用组件
 * 
 * 提供应用导航和功能切换界面
 */
function App(): JSX.Element {
  const [currentView, setCurrentView] = useState<'home' | 'single' | 'multi'>('home')
  const [systemStatus, setSystemStatus] = useState<string>('系统就绪')

  /**
   * 测试前端功能
   */
  const handleTestFrontend = (): void => {
    setSystemStatus('前端功能正常 ✅')
    setTimeout(() => {
      setSystemStatus('系统就绪')
    }, 2000)
  }

  /**
   * 切换到单实例演示
   */
  const handleShowSingleMVVM = (): void => {
    setCurrentView('single')
  }

  /**
   * 切换到多实例演示
   */
  const handleShowMultiMVVM = (): void => {
    setCurrentView('multi')
  }

  /**
   * 返回主页
   */
  const handleBackHome = (): void => {
    setCurrentView('home')
  }

  // 渲染单实例演示
  if (currentView === 'single') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{
          background: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '15px 20px',
          marginBottom: '20px'
        }}>
          <button
            onClick={handleBackHome}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← 返回首页
          </button>
        </div>
        <CounterView />
      </div>
    )
  }

  // 渲染多实例演示
  if (currentView === 'multi') {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <div style={{
          background: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '15px 20px',
          marginBottom: '20px'
        }}>
          <button
            onClick={handleBackHome}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← 返回首页
          </button>
        </div>
        <MultiInstanceDemo />
      </div>
    )
  }

  // 渲染首页
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
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '800px',
        width: '90%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        {/* 标题区域 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '3em',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 10px 0'
          }}>
            Life View
          </h1>
          <p style={{
            fontSize: '1.2em',
            color: '#64748b',
            margin: 0
          }}>
            基于C++ MVVM架构的现代桌面应用框架
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
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0284c7'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#0ea5e9'
            }}
          >
            🧪 测试前端功能
          </button>
        </div>

        {/* MVVM演示区域 */}
        <div style={{
          background: '#f8f4ff',
          border: '1px solid #8b5cf6',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#5b21b6' }}>🚀 MVVM演示</h3>
          <p style={{
            margin: '0 0 20px 0',
            fontSize: '14px',
            color: '#7c3aed',
            lineHeight: '1.5'
          }}>
            体验完整的MVVM架构，包括C++后端ViewModel、IPC通信和React前端数据绑定。
          </p>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleShowSingleMVVM}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
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
              📱 单实例演示
            </button>

            <button
              onClick={handleShowMultiMVVM}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#059669'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981'
              }}
            >
              🎯 多实例演示
            </button>
          </div>
        </div>

        {/* 应用特性展示 */}
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #22c55e',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#15803d' }}>✨ 核心特性</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            fontSize: '14px'
          }}>
            <div style={{ color: '#166534' }}>
              <strong>🏗️ MVVM架构</strong><br />
              C++后端 + React前端
            </div>
            <div style={{ color: '#166534' }}>
              <strong>🔄 双向绑定</strong><br />
              实时属性同步更新
            </div>
            <div style={{ color: '#166534' }}>
              <strong>🚀 高性能</strong><br />
              原生C++业务逻辑
            </div>
            <div style={{ color: '#166534' }}>
              <strong>🔧 多实例</strong><br />
              支持并发多实例管理
            </div>
            <div style={{ color: '#166534' }}>
              <strong>⚡ IPC通信</strong><br />
              高效的进程间通信
            </div>
            <div style={{ color: '#166534' }}>
              <strong>🔒 类型安全</strong><br />
              完整TypeScript支持
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
