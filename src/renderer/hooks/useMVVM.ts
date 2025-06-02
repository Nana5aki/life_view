/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 22:27:18
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-02 10:58:02
 * @FilePath: \life_view\src\renderer\hooks\useMVVM.ts
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import type { MVVMResponse, PropertyChangeEvent } from '../types'

interface UseMVVMReturn {
  executeAction: (actionName: string, ...args: unknown[]) => Promise<unknown>
  getProp: (propName: string) => Promise<unknown>
  onPropertyChange: (propName: string, callback: (value: unknown) => void) => () => void
}

export function useMVVM(viewModelType: string): UseMVVMReturn {
  const [instanceId, setInstanceId] = useState<string>()
  const mountedRef = useRef(true)
  const listenedPropsRef = useRef(new Set<string>())
  const callbacksRef = useRef(new Map<string, Set<(value: unknown) => void>>())

  // 初始化ViewModel
  useEffect(() => {
    mountedRef.current = true
    const listenedProps = listenedPropsRef.current
    const callbacks = callbacksRef.current

    const init = async (): Promise<void> => {
      const result = (await window.electron.ipcRenderer.invoke(
        'mvvm:createViewModel',
        viewModelType
      )) as MVVMResponse
      if (!result.success) throw new Error(result.error)
      if (mountedRef.current) setInstanceId(result.instanceId)
    }

    init()

    return () => {
      mountedRef.current = false
      listenedProps.clear()
      callbacks.clear()
    }
  }, [viewModelType])

  // 清理ViewModel
  useEffect(() => {
    if (!instanceId) return
    return () => {
      window.electron.ipcRenderer.invoke('mvvm:removeViewModel', instanceId)
    }
  }, [instanceId])

  // 监听属性变化
  useEffect(() => {
    if (!instanceId) return

    const handleChange = (_: unknown, ...args: unknown[]): void => {
      const event = args[0] as PropertyChangeEvent
      if (event.instanceId === instanceId && mountedRef.current) {
        const callbacks = callbacksRef.current.get(event.propName)
        if (callbacks) {
          callbacks.forEach((cb) => cb(event.value))
        }
      }
    }

    window.electron.ipcRenderer.on('mvvm:propertyChanged', handleChange)
    return () => window.electron.ipcRenderer.removeListener('mvvm:propertyChanged', handleChange)
  }, [instanceId])

  const executeAction = useCallback(
    async (actionName: string, ...args: unknown[]) => {
      if (!instanceId) throw new Error('viewmodel not init!')
      const result = (await window.electron.ipcRenderer.invoke(
        'mvvm:executeAction',
        instanceId,
        actionName,
        ...args
      )) as MVVMResponse
      if (!result.success) throw new Error(result.error)
      return result.result
    },
    [instanceId]
  )

  const getProp = useCallback(
    async (propName: string) => {
      if (!instanceId) throw new Error('viewmodel not init!')
      const result = (await window.electron.ipcRenderer.invoke(
        'mvvm:getProp',
        instanceId,
        propName
      )) as MVVMResponse
      if (!result.success) throw new Error(result.error)
      return result.result
    },
    [instanceId]
  )

  const onPropertyChange = useCallback(
    (propName: string, callback: (value: unknown) => void) => {
      let callbacks = callbacksRef.current.get(propName)
      if (!callbacks) {
        callbacks = new Set()
        callbacksRef.current.set(propName, callbacks)
      }
      callbacks.add(callback)

      // 添加监听器
      if (instanceId && !listenedPropsRef.current.has(propName)) {
        window.electron.ipcRenderer.invoke('mvvm:addPropertyListener', instanceId, propName)
        listenedPropsRef.current.add(propName)
      }

      return () => {
        const callbacks = callbacksRef.current.get(propName)
        if (callbacks) {
          callbacks.delete(callback)
          if (callbacks.size === 0) callbacksRef.current.delete(propName)
        }
      }
    },
    [instanceId]
  )

  return { executeAction, getProp, onPropertyChange }
}
