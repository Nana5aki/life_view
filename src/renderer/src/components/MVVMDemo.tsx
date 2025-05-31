import React, { useState } from 'react'
import CounterView from './CounterView'
import { useMVVM } from '../hooks/useMVVM'

const MVVMDemo: React.FC = () => {
  const { viewModels, isConnected, refreshAllViewModels } = useMVVM()
  const [activeTab, setActiveTab] = useState('counter')

  return (
    <div className="mvvm-demo">
      <div className="demo-header">
        <h1>MVVM框架演示</h1>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '已连接' : '未连接'}
          </span>
          <button onClick={refreshAllViewModels} className="btn btn-small">
            刷新
          </button>
        </div>
      </div>

      <div className="demo-tabs">
        <button 
          className={`tab ${activeTab === 'counter' ? 'active' : ''}`}
          onClick={() => setActiveTab('counter')}
        >
          计数器示例
        </button>
        <button 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          框架信息
        </button>
      </div>

      <div className="demo-content">
        {activeTab === 'counter' && <CounterView />}
        {activeTab === 'info' && (
          <div className="framework-info">
            <h2>MVVM框架信息</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>已注册的ViewModels</h3>
                <div className="viewmodel-list">
                  {Object.keys(viewModels).map(name => (
                    <div key={name} className="viewmodel-item">
                      <strong>{name}</strong>
                      <div className="viewmodel-details">
                        <div>属性数量: {Object.keys(viewModels[name]?.properties || {}).length}</div>
                        <div>操作数量: {viewModels[name]?.actions?.length || 0}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="info-card">
                <h3>架构特点</h3>
                <ul className="feature-list">
                  <li>✅ C++实现的Model和ViewModel基类</li>
                  <li>✅ 属性变化自动通知机制</li>
                  <li>✅ Action方法系统</li>
                  <li>✅ 前端React实时同步</li>
                  <li>✅ 类型安全的数据绑定</li>
                  <li>✅ 可扩展的业务继承模式</li>
                </ul>
              </div>

              <div className="info-card">
                <h3>使用说明</h3>
                <div className="usage-guide">
                  <p><strong>1. 创建Model:</strong> 继承mvvm::Model基类，定义业务属性</p>
                  <p><strong>2. 创建ViewModel:</strong> 继承mvvm::ViewModel基类，注册Action方法</p>
                  <p><strong>3. 注册到管理器:</strong> 使用MVVMManager注册ViewModel实例</p>
                  <p><strong>4. 前端使用:</strong> 通过useMVVM Hook连接和操作</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MVVMDemo 