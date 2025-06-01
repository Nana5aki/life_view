import { useState, useEffect, useCallback, useRef } from 'react'
import type { MVVMResponse, ViewModelState, PropertyChangeEvent } from '../types'

/**
 * ViewModel实例状态接口
 */
interface ViewModelInstance {
  instanceId?: string
  viewId?: string
  properties: Record<string, unknown>
  actions: string[]
  listenedProperties: Set<string>
}

/**
 * useMVVM Hook返回值接口
 */
interface UseMVVMReturn {
  // 状态属性
  viewModel: ViewModelInstance
  isReady: boolean
  error: string | null
  
  // 便捷访问属性
  properties: Record<string, unknown>
  viewId: string | undefined
  
  // 操作方法
  addPropertyListener: (propName: string) => Promise<boolean>
  executeAction: (actionName: string, ...args: unknown[]) => Promise<unknown>
  getProp: (propName: string) => unknown
  refresh: () => Promise<void>
}

/**
 * MVVM Hook - 用于管理与C++后端ViewModel的交互
 * 
 * @param viewModelType ViewModel类型，如 'counter'
 * @returns MVVM操作接口
 */
export function useMVVM(viewModelType: string): UseMVVMReturn {
  // 状态管理
  const [viewModel, setViewModel] = useState<ViewModelInstance>({
    properties: {},
    actions: [],
    listenedProperties: new Set()
  })
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 用于防止组件卸载后继续更新状态
  const mountedRef = useRef(true)

  /**
   * 初始化ViewModel实例
   */
  useEffect(() => {
    mountedRef.current = true
    
    async function initViewModel(): Promise<void> {
      try {
        setError(null)
        console.log(`正在创建ViewModel: ${viewModelType}`)
        
        // 1. 创建ViewModel实例
        const createResult: MVVMResponse = await window.electron.ipcRenderer.invoke(
          'mvvm:createViewModel',
          viewModelType
        )

        if (!mountedRef.current) return

        if (!createResult.success) {
          throw new Error(createResult.error || '创建ViewModel失败')
        }

        console.log(`ViewModel创建成功: ${createResult.instanceId}`)

        // 2. 获取初始状态
        const stateResult: MVVMResponse<ViewModelState> = await window.electron.ipcRenderer.invoke(
          'mvvm:getState',
          createResult.instanceId
        )

        if (!mountedRef.current) return

        if (stateResult.success && stateResult.state) {
          setViewModel({
            instanceId: createResult.instanceId,
            viewId: createResult.viewId,
            properties: stateResult.state.properties || {},
            actions: stateResult.state.actions || [],
            listenedProperties: new Set(stateResult.state.listenedProperties || [])
          })
          setIsReady(true)
          console.log('ViewModel初始化完成', stateResult.state)
        } else {
          throw new Error(stateResult.error || '获取ViewModel状态失败')
        }
      } catch (err) {
        if (mountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : '未知错误'
          console.error('ViewModel初始化失败:', errorMessage)
          setError(errorMessage)
        }
      }
    }

    initViewModel()

    // 清理函数
    return () => {
      mountedRef.current = false
      if (viewModel.instanceId) {
        console.log(`清理ViewModel实例: ${viewModel.instanceId}`)
        window.electron.ipcRenderer.invoke('mvvm:removeViewModel', viewModel.instanceId)
          .catch(err => console.error('清理ViewModel失败:', err))
      }
    }
  }, [viewModelType]) // 仅在viewModelType变化时重新初始化

  /**
   * 监听属性变化事件
   */
  useEffect(() => {
    if (!viewModel.instanceId) return

    function handlePropertyChange(event: unknown, changeInfo: PropertyChangeEvent): void {
      // 确保事件属于当前ViewModel实例
      if (changeInfo.instanceId === viewModel.instanceId && mountedRef.current) {
        console.log(`属性变化: ${changeInfo.propName} = ${changeInfo.value}`)
        
        setViewModel(prev => ({
          ...prev,
          properties: {
            ...prev.properties,
            [changeInfo.propName]: changeInfo.value
          }
        }))
      }
    }

    // 注册事件监听器
    window.electron.ipcRenderer.on('mvvm:propertyChanged', handlePropertyChange)

    return () => {
      // 移除事件监听器
      window.electron.ipcRenderer.removeListener('mvvm:propertyChanged', handlePropertyChange)
    }
  }, [viewModel.instanceId])

  /**
   * 添加属性监听器
   * 
   * @param propName 属性名称
   * @returns 是否添加成功
   */
  const addPropertyListener = useCallback(
    async (propName: string): Promise<boolean> => {
      if (!viewModel.instanceId) {
        console.warn('ViewModel实例未准备好，无法添加属性监听器')
        return false
      }

      // 避免重复添加监听器
      if (viewModel.listenedProperties.has(propName)) {
        console.log(`属性 ${propName} 已在监听中`)
        return true
      }

      try {
        console.log(`添加属性监听器: ${propName}`)
        
        const result: MVVMResponse = await window.electron.ipcRenderer.invoke(
          'mvvm:addPropertyListener',
          viewModel.instanceId,
          propName
        )

        if (result.success) {
          // 更新本地监听列表
          setViewModel(prev => ({
            ...prev,
            listenedProperties: new Set([...prev.listenedProperties, propName])
          }))
          return true
        } else {
          console.error('添加属性监听器失败:', result.error)
          return false
        }
      } catch (err) {
        console.error('添加属性监听器异常:', err)
        return false
      }
    },
    [viewModel.instanceId, viewModel.listenedProperties]
  )

  /**
   * 执行ViewModel操作
   * 
   * @param actionName 操作名称
   * @param args 操作参数
   * @returns 操作结果
   */
  const executeAction = useCallback(
    async (actionName: string, ...args: unknown[]): Promise<unknown> => {
      if (!viewModel.instanceId) {
        const error = 'ViewModel实例未准备好，无法执行操作'
        console.error(error)
        throw new Error(error)
      }

      try {
        console.log(`执行操作: ${actionName}`, args)
        
        const result: MVVMResponse = await window.electron.ipcRenderer.invoke(
          'mvvm:executeAction',
          viewModel.instanceId,
          actionName,
          ...args
        )

        if (result.success) {
          console.log(`操作 ${actionName} 执行成功`)
          return result.result
        } else {
          throw new Error(result.error || '操作执行失败')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '操作执行异常'
        console.error(`操作 ${actionName} 失败:`, errorMessage)
        throw new Error(errorMessage)
      }
    },
    [viewModel.instanceId]
  )

  /**
   * 获取属性值
   * 
   * @param propName 属性名称
   * @returns 属性值
   */
  const getProp = useCallback(
    (propName: string): unknown => {
      return viewModel.properties[propName]
    },
    [viewModel.properties]
  )

  /**
   * 刷新ViewModel状态
   */
  const refresh = useCallback(async (): Promise<void> => {
    if (!viewModel.instanceId) return

    try {
      const stateResult: MVVMResponse<ViewModelState> = await window.electron.ipcRenderer.invoke(
        'mvvm:getState',
        viewModel.instanceId
      )

      if (stateResult.success && stateResult.state && mountedRef.current) {
        setViewModel(prev => ({
          ...prev,
          properties: stateResult.state!.properties || {},
          actions: stateResult.state!.actions || []
        }))
      }
    } catch (err) {
      console.error('刷新ViewModel状态失败:', err)
    }
  }, [viewModel.instanceId])

  return {
    // 状态
    viewModel,
    isReady,
    error,

    // 便捷访问
    properties: viewModel.properties,
    viewId: viewModel.viewId,

    // 方法
    addPropertyListener,
    executeAction,
    getProp,
    refresh
  }
}
