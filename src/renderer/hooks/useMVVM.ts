/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 22:27:18
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-15 17:49:41
 * @FilePath: \life_view\src\renderer\hooks\useMVVM.ts
 */
import { useState, useEffect, useCallback, useRef } from 'react'

interface ViewModelInstance {
  GetProp(prop_name: string): unknown
  BindProperty(
    prop_name: string,
    callback: (ChangeInfo: { prop_name: string; value: unknown }) => void
  ): void
  ExcuteCommand(command_name: string, param?: unknown): void
}

interface UseMVVMReturn {
  ExcuteCommand: (command_name: string, ...args: unknown[]) => void
  GetProp: (prop_name: string) => unknown
  BindProperty: (prop_name: string, callback: (value: unknown) => void) => () => void
}

export function useMVVM(viewmodel_type: string): UseMVVMReturn {
  const [viewModelInstance, setViewModelInstance] = useState<ViewModelInstance | null>(null)
  const mountedRef = useRef(true)

  // 初始化ViewModel - 直接调用C++接口
  useEffect(() => {
    mountedRef.current = true

    try {
      // 检查 window.api 是否存在
      if (!window.api?.mvvm?.CreateViewModel) {
        throw new Error('C++ MVVM api not loaded')
      }

      const instance = window.api.mvvm.CreateViewModel(viewmodel_type)

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
  }, [viewmodel_type])

  const ExcuteCommand = useCallback(
    (command_name: string, ...args: unknown[]) => {
      if (!viewModelInstance) {
        console.error('useMVVM: ViewModel not init')
        return
      }

      try {
        if (args.length > 0) {
          viewModelInstance.ExcuteCommand(command_name, args[0])
        } else {
          viewModelInstance.ExcuteCommand(command_name)
        }
      } catch (error) {
        console.error('useMVVM: execute command failed:', command_name, error)
      }
    },
    [viewModelInstance]
  )

  const GetProp = useCallback(
    (prop_name: string) => {
      if (!viewModelInstance) {
        console.error('useMVVM: ViewModel not init')
        return undefined
      }

      try {
        const value = viewModelInstance.GetProp(prop_name)
        return value
      } catch (error) {
        console.error('useMVVM: get prop failed:', prop_name, error)
        return undefined
      }
    },
    [viewModelInstance]
  )

  const BindProperty = useCallback(
    (prop_name: string, callback: (value: unknown) => void) => {
      if (!viewModelInstance) {
        console.error('useMVVM: ViewModel not init')
        return () => {}
      }

      // 为这个属性添加监听器
      try {
        viewModelInstance.BindProperty(prop_name, (ChangeInfo) => {
          if (mountedRef.current) {
            callback(ChangeInfo.value)
          }
        })
      } catch (error) {
        console.error('useMVVM: add prop listener failed:', prop_name, error)
      }

      return () => {}
    },
    [viewModelInstance]
  )

  return { ExcuteCommand, GetProp, BindProperty }
}
