/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:11:43
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-02 11:02:38
 * @FilePath: \life_view\src\main\mvvm-handler.ts
 */
import { ipcMain } from 'electron'

// Define types based on actual C++ API
interface ViewModelInstance {
  action(actionName: string, param?: unknown): void
  addPropertyListener(propName: string, callback: (changeInfo: PropertyChangeInfo) => void): void
  getProp(propName: string): unknown
}

interface PropertyChangeInfo {
  propName: string
  value: unknown
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

function generateInstanceId(): string {
  return `vm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function registerMVVMHandlers(): void {
  if (!global.viewModelInstances) {
    global.viewModelInstances = new Map()
  }

  ipcMain.handle('mvvm:createViewModel', async (_, viewModelType: string) => {
    const mvvm = initMVVM()
    if (!mvvm) {
      throw new Error('native mvvm module init failed')
    }
    const viewModelInstance = mvvm.createViewModel(viewModelType)
    if (!viewModelInstance) {
      throw new Error(`create view model failed: ${viewModelType}`)
    }
    const instanceId = generateInstanceId()
    global.viewModelInstances!.set(instanceId, viewModelInstance)
    return {
      success: true,
      instanceId: instanceId
    }
  })

  ipcMain.handle(
    'mvvm:executeAction',
    async (_, instanceId: string, actionName: string, ...args: unknown[]) => {
      const viewModelInstance = global.viewModelInstances?.get(instanceId)
      if (!viewModelInstance) {
        throw new Error(`not find viewmodel: ${instanceId}`)
      }
      if (args.length > 0) {
        viewModelInstance.action(actionName, args[0])
      } else {
        viewModelInstance.action(actionName)
      }
      return { success: true }
    }
  )

  ipcMain.handle(
    'mvvm:addPropertyListener',
    async (event, instanceId: string, propName: string) => {
      const viewModelInstance = global.viewModelInstances?.get(instanceId)
      if (!viewModelInstance) {
        throw new Error(`not find viewmodel: ${instanceId}`)
      }

      viewModelInstance.addPropertyListener(propName, (changeInfo: PropertyChangeInfo) => {
        event.sender.send('mvvm:propertyChanged', {
          instanceId,
          propName: changeInfo.propName,
          value: changeInfo.value
        })
      })

      return { success: true }
    }
  )

  ipcMain.handle('mvvm:getProp', async (_, instanceId: string, propName: string) => {
    const viewModelInstance = global.viewModelInstances?.get(instanceId)
    if (!viewModelInstance) {
      throw new Error(`not find viewmodel: ${instanceId}`)
    }
    const value = viewModelInstance.getProp(propName)
    return { success: true, result: value }
  })

  ipcMain.handle('mvvm:removeViewModel', async (_, instanceId: string) => {
    if (global.viewModelInstances?.has(instanceId)) {
      global.viewModelInstances.delete(instanceId)
      return { success: true }
    }

    return { success: false, error: 'remove failed, not has this viewmodel ' }
  })
}
