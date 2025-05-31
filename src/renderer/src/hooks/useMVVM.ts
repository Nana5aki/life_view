import { useState, useEffect, useCallback } from 'react'

// MVVM框架的类型定义
interface PropertyChangeEvent {
  viewModelName: string
  propertyName: string
  newValue: any
}

interface ViewModelState {
  properties: Record<string, any>
  actions: string[]
}

// MVVM Hook
export function useMVVM() {
  const [viewModels, setViewModels] = useState<Record<string, ViewModelState>>({})
  const [isConnected, setIsConnected] = useState(false)

  // 初始化MVVM连接
  useEffect(() => {
    const initializeMVVM = async () => {
      try {
        // 设置属性变化监听器
        await window.electron.ipcRenderer.invoke('mvvm-set-callback')
        
        // 获取所有ViewModels的初始状态
        const allViewModels = await window.electron.ipcRenderer.invoke('mvvm-get-all')
        setViewModels(allViewModels)
        setIsConnected(true)
        
        console.log('MVVM框架初始化成功:', allViewModels)
      } catch (error) {
        console.error('MVVM框架初始化失败:', error)
      }
    }

    initializeMVVM()

    // 监听属性变化事件
    const handlePropertyChange = (event: PropertyChangeEvent) => {
      console.log('属性变化:', event)
      setViewModels(prev => {
        const updated = { ...prev }
        if (updated[event.viewModelName]) {
          updated[event.viewModelName] = {
            ...updated[event.viewModelName],
            properties: {
              ...updated[event.viewModelName].properties,
              [event.propertyName]: event.newValue
            }
          }
        }
        return updated
      })
    }

    // 注册属性变化监听器
    window.electron.ipcRenderer.on('mvvm-property-changed', handlePropertyChange)

    return () => {
      window.electron.ipcRenderer.removeAllListeners('mvvm-property-changed')
    }
  }, [])

  // 执行ViewModel的Action
  const executeAction = useCallback(async (viewModelName: string, actionName: string, ...args: any[]) => {
    try {
      await window.electron.ipcRenderer.invoke('mvvm-execute-action', viewModelName, actionName, ...args)
    } catch (error) {
      console.error(`执行Action失败 (${viewModelName}.${actionName}):`, error)
      throw error
    }
  }, [])

  // 获取特定ViewModel的状态
  const getViewModelState = useCallback(async (viewModelName: string) => {
    try {
      const state = await window.electron.ipcRenderer.invoke('mvvm-get-state', viewModelName)
      return state
    } catch (error) {
      console.error(`获取ViewModel状态失败 (${viewModelName}):`, error)
      throw error
    }
  }, [])

  // 刷新所有ViewModels状态
  const refreshAllViewModels = useCallback(async () => {
    try {
      const allViewModels = await window.electron.ipcRenderer.invoke('mvvm-get-all')
      setViewModels(allViewModels)
    } catch (error) {
      console.error('刷新ViewModels失败:', error)
    }
  }, [])

  return {
    viewModels,
    isConnected,
    executeAction,
    getViewModelState,
    refreshAllViewModels
  }
} 