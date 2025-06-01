/*
 * @Author: Nana5aki
 * @Date: 2025-06-01 00:42:05
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 18:18:42
 * @FilePath: \life_view\src\renderer\types.d.ts
 */
/// <reference types="react" />
/// <reference types="react-dom" />

/**
 * 全局窗口对象扩展，定义Electron API接口
 */
declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        /** 调用主进程方法并等待返回结果 */
        invoke: (channel: string, ...args: unknown[]) => Promise<any>
        /** 监听来自主进程的事件 */
        on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void
        /** 移除事件监听器 */
        removeListener: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void
        /** 向主进程发送消息 */
        send: (channel: string, ...args: unknown[]) => void
      }
    }
    api: unknown
  }
}

/**
 * MVVM相关类型定义
 */
export interface MVVMResponse<T = unknown> {
  success: boolean
  error?: string
  result?: T
  state?: ViewModelState
  instanceId?: string
  viewId?: string
}

export interface ViewModelState {
  properties: Record<string, unknown>
  actions: string[]
  listenedProperties: string[]
}

export interface PropertyChangeEvent {
  instanceId: string
  viewId: string
  propName: string
  value: unknown
}

/**
 * 计数器ViewModel的属性类型定义
 */
export interface CounterProperties {
  count: number
  message: string
  isEven: boolean
}

/**
 * 计数器ViewModel的操作类型定义
 */
export type CounterActions = 'increment' | 'decrement' | 'reset' | 'addNumber' 