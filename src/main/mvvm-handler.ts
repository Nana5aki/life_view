/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:11:43
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-02 00:04:43
 * @FilePath: \life_view\src\main\mvvm-handler.ts
 */
import { ipcMain } from 'electron'

// Define types based on actual C++ API
interface ViewModelInstance {
  getViewId(): string
  action(actionName: string, param?: unknown): void
  addPropertyListener(propName: string, callback: (changeInfo: PropertyChangeInfo) => void): void
  getState(): ViewModelState
  getProp(propName: string): unknown
}

interface PropertyChangeInfo {
  viewId: string
  propName: string
  value: unknown
}

interface ViewModelState {
  properties: Record<string, unknown>
  actions: string[]
  listenedProperties: string[]
}

let mvvmNative: {
  createViewModel: (type: string) => ViewModelInstance
} | null = null

// 存储ViewModel实例的映射
declare global {
  // eslint-disable-next-line no-var
  var viewModelInstances: Map<string, ViewModelInstance> | undefined
}

/**
 * 初始化MVVM原生模块
 */
function initMVVM(): typeof mvvmNative {
  if (!mvvmNative) {
    // 动态加载原生模块，避免TypeScript警告
    const requireFunc = eval('require')
    mvvmNative = requireFunc('../../backend/build/Release/life_view_backend.node')
  }
  return mvvmNative
}

/**
 * 生成唯一的实例ID
 */
function generateInstanceId(): string {
  return `vm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 注册MVVM相关的IPC处理器
 */
export function registerMVVMHandlers(): void {
  // 初始化全局存储
  if (!global.viewModelInstances) {
    global.viewModelInstances = new Map()
  }

  /**
   * 创建ViewModel实例
   */
  ipcMain.handle('mvvm:createViewModel', async (event, viewModelType: string) => {
    const mvvm = initMVVM()
    if (!mvvm) {
      throw new Error('MVVM原生模块初始化失败')
    }

    // 创建ViewModel实例
    const viewModelInstance = mvvm.createViewModel(viewModelType)
    if (!viewModelInstance) {
      throw new Error(`创建ViewModel失败: ${viewModelType}`)
    }

    // 获取viewId（现在C++对象有这个方法了）
    const viewId = viewModelInstance.getViewId()
    const instanceId = generateInstanceId()

    // 存储实例
    global.viewModelInstances!.set(instanceId, viewModelInstance)

    return {
      success: true,
      instanceId: instanceId,
      viewId: viewId
    }
  })

  /**
   * 执行ViewModel操作
   */
  ipcMain.handle(
    'mvvm:executeAction',
    async (event, instanceId: string, actionName: string, ...args: unknown[]) => {
      const viewModelInstance = global.viewModelInstances?.get(instanceId)
      if (!viewModelInstance) {
        throw new Error(`ViewModel实例未找到: ${instanceId}`)
      }

      // 调用C++的action方法，传递第一个参数（如果有的话）
      if (args.length > 0) {
        viewModelInstance.action(actionName, args[0])
      } else {
        viewModelInstance.action(actionName)
      }

      return { success: true }
    }
  )

  /**
   * 添加属性监听器
   */
  ipcMain.handle(
    'mvvm:addPropertyListener',
    async (event, instanceId: string, propName: string) => {
      const viewModelInstance = global.viewModelInstances?.get(instanceId)
      if (!viewModelInstance) {
        throw new Error(`ViewModel实例未找到: ${instanceId}`)
      }

      // 添加监听器，将变化转发给渲染进程
      viewModelInstance.addPropertyListener(propName, (changeInfo: PropertyChangeInfo) => {
        // 转发给渲染进程
        event.sender.send('mvvm:propertyChanged', {
          instanceId,
          viewId: changeInfo.viewId,
          propName: changeInfo.propName,
          value: changeInfo.value
        })
      })

      return { success: true }
    }
  )

  /**
   * 获取单个属性值
   */
  ipcMain.handle('mvvm:getProp', async (event, instanceId: string, propName: string) => {
    const viewModelInstance = global.viewModelInstances?.get(instanceId)
    if (!viewModelInstance) {
      throw new Error(`ViewModel实例未找到: ${instanceId}`)
    }

    // 直接调用C++的getProp方法
    const value = viewModelInstance.getProp(propName)

    return { success: true, result: value }
  })

  ipcMain.handle('mvvm:getState', async (event, instanceId: string) => {
    const viewModelInstance = global.viewModelInstances?.get(instanceId)
    if (!viewModelInstance) {
      throw new Error(`ViewModel实例未找到: ${instanceId}`)
    }

    // 简化状态返回，主要用于调试
    const state = {
      instanceId,
      viewId: viewModelInstance.getViewId(),
      timestamp: new Date().toISOString()
    }

    return { success: true, state }
  })

  /**
   * 移除ViewModel实例
   */
  ipcMain.handle('mvvm:removeViewModel', async (event, instanceId: string) => {
    if (global.viewModelInstances?.has(instanceId)) {
      global.viewModelInstances.delete(instanceId)
      return { success: true }
    }

    return { success: false, error: '实例不存在' }
  })
}
