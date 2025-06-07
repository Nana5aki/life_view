/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 22:27:18
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-07 14:52:55
 * @FilePath: \life_view\src\renderer\hooks\useMVVM.ts
 */
import { useState, useEffect, useCallback, useRef } from 'react'

interface ViewModelInstance {
  getProp(propName: string): unknown
  addPropertyListener(
    propName: string,
    callback: (changeInfo: { propName: string; value: unknown }) => void
  ): void
  action(actionName: string, param?: unknown): void
}

interface UseMVVMReturn {
  executeAction: (actionName: string, ...args: unknown[]) => void
  getProp: (propName: string) => unknown
  onPropertyChange: (propName: string, callback: (value: unknown) => void) => () => void
}

export function useMVVM(viewModelType: string): UseMVVMReturn {
  const [viewModelInstance, setViewModelInstance] = useState<ViewModelInstance | null>(null)
  const mountedRef = useRef(true)

  // 初始化ViewModel - 直接调用C++接口
  useEffect(() => {
    mountedRef.current = true

    try {
      // 检查 window.api 是否存在
      if (!window.api?.mvvm?.createViewModel) {
        throw new Error('C++ MVVM api not loaded')
      }

      const instance = window.api.mvvm.createViewModel(viewModelType)

      if (mountedRef.current) {
        setViewModelInstance(instance)
      }
    } catch (error) {
      console.error('useMVVM: ViewModel create failed:', error)
      if (mountedRef.current) {
        setViewModelInstance(null)
      }
    }

    return () => {
      mountedRef.current = false
    }
  }, [viewModelType])

  const executeAction = useCallback(
    (actionName: string, ...args: unknown[]) => {
      if (!viewModelInstance) {
        console.error('useMVVM: ViewModel not init')
        return
      }

      try {
        if (args.length > 0) {
          viewModelInstance.action(actionName, args[0])
        } else {
          viewModelInstance.action(actionName)
        }
      } catch (error) {
        console.error('useMVVM: execute action failed:', actionName, error)
      }
    },
    [viewModelInstance]
  )

  const getProp = useCallback(
    (propName: string) => {
      if (!viewModelInstance) {
        console.error('useMVVM: ViewModel not init')
        return undefined
      }

      try {
        const value = viewModelInstance.getProp(propName)
        return value
      } catch (error) {
        console.error('useMVVM: get prop failed:', propName, error)
        return undefined
      }
    },
    [viewModelInstance]
  )

  const onPropertyChange = useCallback(
    (propName: string, callback: (value: unknown) => void) => {
      if (!viewModelInstance) {
        console.error('useMVVM: ViewModel not init')
        return () => {}
      }

      // 为这个属性添加监听器
      try {
        viewModelInstance.addPropertyListener(propName, (changeInfo) => {
          if (mountedRef.current) {
            callback(changeInfo.value)
          }
        })
      } catch (error) {
        console.error('useMVVM: add prop listener failed:', propName, error)
      }

      return () => {}
    },
    [viewModelInstance]
  )

  return { executeAction, getProp, onPropertyChange }
}
