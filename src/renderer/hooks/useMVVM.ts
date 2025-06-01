import { useState, useEffect, useCallback, useRef } from 'react'
import type { MVVMResponse, PropertyChangeEvent } from '../types'

/**
 * ViewModel实例状态接口
 */
interface ViewModelInstance {
  instanceId?: string
  viewId?: string
}

/**
 * useMVVM Hook返回值接口
 */
interface UseMVVMReturn {
  // 状态属性
  instanceId: string | undefined
  viewId: string | undefined
  isReady: boolean
  error: string | null

  // 操作方法
  executeAction: (actionName: string, ...args: unknown[]) => Promise<unknown>
  getProp: (propName: string) => Promise<unknown>
  onPropertyChange: (propName: string, callback: (value: unknown) => void) => () => void
}

export function useMVVM(viewModelType: string): UseMVVMReturn {
  // 简化状态管理
  const [viewModel, setViewModel] = useState<ViewModelInstance>({})
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 用于防止组件卸载后继续更新状态
  const mountedRef = useRef(true)

  // 本地追踪已监听的属性，避免重复添加
  const listenedPropsRef = useRef<Set<string>>(new Set())

  // 属性变化回调映射
  const propertyCallbacksRef = useRef<Map<string, Set<(value: unknown) => void>>>(new Map())

  /**
   * 初始化ViewModel实例
   */
  useEffect(() => {
    mountedRef.current = true

    async function initViewModel(): Promise<void> {
      try {
        setError(null)

        // 创建ViewModel实例
        const createResult = await window.electron.ipcRenderer.invoke(
          'mvvm:createViewModel',
          viewModelType
        ) as MVVMResponse

        if (!mountedRef.current) return

        if (!createResult.success) {
          throw new Error(createResult.error || '创建ViewModel失败')
        }

        // 设置实例信息，不再获取初始状态
        setViewModel({
          instanceId: createResult.instanceId,
          viewId: createResult.viewId
        })
        setIsReady(true)
      } catch (err) {
        if (mountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : '未知错误'
          setError(errorMessage)
        }
      }
    }

    initViewModel()

    // 清理函数
    return () => {
      mountedRef.current = false
      listenedPropsRef.current.clear()
      propertyCallbacksRef.current.clear()

      if (viewModel.instanceId) {
        window.electron.ipcRenderer
          .invoke('mvvm:removeViewModel', viewModel.instanceId)
          .catch(() => {
            // 静默处理清理错误
          })
      }
    }
  }, [viewModelType])

  /**
   * 监听属性变化事件
   */
  useEffect(() => {
    if (!viewModel.instanceId) return

    function handlePropertyChange(_event: unknown, ...args: unknown[]): void {
      const changeInfo = args[0] as PropertyChangeEvent
      // 确保事件属于当前ViewModel实例
      if (changeInfo.instanceId === viewModel.instanceId && mountedRef.current) {
        // 触发属性变化回调
        const callbacks = propertyCallbacksRef.current.get(changeInfo.propName)
        if (callbacks) {
          callbacks.forEach((callback) => {
            try {
              callback(changeInfo.value)
            } catch {
              // 静默处理回调错误
            }
          })
        }
      }
    }

    // 注册事件监听器
    window.electron.ipcRenderer.on('mvvm:propertyChanged', handlePropertyChange)

    return () => {
      // 移除事件监听器
      window.electron.ipcRenderer.removeListener('mvvm:propertyChanged', handlePropertyChange)
    }
  }, [viewModel.instanceId])

  const addPropertyListener = useCallback(
    async (propName: string): Promise<boolean> => {
      if (!viewModel.instanceId) {
        return false
      }

      // 避免重复添加监听器
      if (listenedPropsRef.current.has(propName)) {
        return true
      }

      try {
        const result = await window.electron.ipcRenderer.invoke(
          'mvvm:addPropertyListener',
          viewModel.instanceId,
          propName
        ) as MVVMResponse

        if (result.success) {
          // 更新本地监听列表
          listenedPropsRef.current.add(propName)
          return true
        } else {
          return false
        }
      } catch {
        return false
      }
    },
    [viewModel.instanceId]
  )

  const executeAction = useCallback(
    async (actionName: string, ...args: unknown[]): Promise<unknown> => {
      if (!viewModel.instanceId) {
        const error = 'ViewModel实例未准备好，无法执行操作'
        throw new Error(error)
      }

      try {
        const result = await window.electron.ipcRenderer.invoke(
          'mvvm:executeAction',
          viewModel.instanceId,
          actionName,
          ...args
        ) as MVVMResponse

        if (result.success) {
          return result.result
        } else {
          throw new Error(result.error || '操作执行失败')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '操作执行异常'
        throw new Error(errorMessage)
      }
    },
    [viewModel.instanceId]
  )

  const getProp = useCallback(
    async (propName: string): Promise<unknown> => {
      if (!viewModel.instanceId) {
        throw new Error('ViewModel实例未准备好')
      }

      const result = await window.electron.ipcRenderer.invoke(
        'mvvm:getProp',
        viewModel.instanceId,
        propName
      ) as MVVMResponse

      if (result.success) {
        return result.result
      } else {
        throw new Error(result.error || '获取属性失败')
      }
    },
    [viewModel.instanceId]
  )

  const onPropertyChange = useCallback(
    (propName: string, callback: (value: unknown) => void): (() => void) => {
      // 获取或创建回调集合
      let callbacks = propertyCallbacksRef.current.get(propName)
      if (!callbacks) {
        callbacks = new Set()
        propertyCallbacksRef.current.set(propName, callbacks)
      }

      // 添加回调
      callbacks.add(callback)

      // 自动添加属性监听器
      addPropertyListener(propName).catch(() => {
        // 静默处理监听器添加失败
      })

      // 返回取消监听的函数
      return () => {
        const callbacks = propertyCallbacksRef.current.get(propName)
        if (callbacks) {
          callbacks.delete(callback)
          if (callbacks.size === 0) {
            propertyCallbacksRef.current.delete(propName)
          }
        }
      }
    },
    [addPropertyListener]
  )

  return {
    // 状态
    instanceId: viewModel.instanceId,
    viewId: viewModel.viewId,
    isReady,
    error,

    // 方法
    executeAction,
    getProp,
    onPropertyChange
  }
}
