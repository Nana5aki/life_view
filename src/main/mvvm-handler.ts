/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:11:43
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 01:15:14
 * @FilePath: \life_view\src\main\mvvm-handler.ts
 */
import { ipcMain } from 'electron'

// Define types based on actual C++ API
interface ViewModelInstance {
  getViewId(): string;
  action(actionName: string, param?: unknown): void;
  addPropertyListener(propName: string, callback: (changeInfo: PropertyChangeInfo) => void): void;
  getState(): ViewModelState;
}

interface PropertyChangeInfo {
  viewId: string;
  propName: string;
  value: unknown;
}

interface ViewModelState {
  properties: Record<string, unknown>;
  actions: string[];
  listenedProperties: string[];
}

let mvvmNative: {
  createViewModel: (type: string) => ViewModelInstance;
} | null = null

// 存储ViewModel实例的映射
declare global {
  var viewModelInstances: Map<string, ViewModelInstance> | undefined;
}

/**
 * 初始化MVVM原生模块
 */
function initMVVM(): typeof mvvmNative {
  if (!mvvmNative) {
    try {
      // 动态加载原生模块，避免TypeScript警告
      const requireFunc = eval('require')
      mvvmNative = requireFunc('../../backend/build/Release/life_view_backend.node')
      console.log('✅ MVVM原生模块加载成功')
    } catch (error) {
      console.error('❌ 加载MVVM原生模块失败:', error)
      throw error
    }
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
    try {
      console.log(`🚀 正在创建ViewModel: ${viewModelType}`)
      
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
      global.viewModelInstances.set(instanceId, viewModelInstance)
      
      console.log(`✅ ViewModel创建成功: ${instanceId} (viewId: ${viewId})`)
      
      return {
        success: true,
        instanceId: instanceId,
        viewId: viewId
      }
    } catch (error) {
      console.error('❌ 创建ViewModel失败:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '未知错误' 
      }
    }
  })

  /**
   * 执行ViewModel操作
   */
  ipcMain.handle('mvvm:executeAction', async (event, instanceId: string, actionName: string, ...args: unknown[]) => {
    try {
      const viewModelInstance = global.viewModelInstances?.get(instanceId)
      if (!viewModelInstance) {
        throw new Error(`ViewModel实例未找到: ${instanceId}`)
      }
      
      console.log(`🎯 执行操作: ${actionName}`, args.length > 0 ? `参数: ${JSON.stringify(args)}` : '无参数')
      
      // 调用C++的action方法，传递第一个参数（如果有的话）
      if (args.length > 0) {
        viewModelInstance.action(actionName, args[0])
      } else {
        viewModelInstance.action(actionName)
      }
      
      console.log(`✅ 操作执行成功: ${actionName}`)
      return { success: true }
    } catch (error) {
      console.error(`❌ 执行操作失败 (${actionName}):`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '操作执行失败' 
      }
    }
  })

  /**
   * 添加属性监听器
   */
  ipcMain.handle('mvvm:addPropertyListener', async (event, instanceId: string, propName: string) => {
    try {
      const viewModelInstance = global.viewModelInstances?.get(instanceId)
      if (!viewModelInstance) {
        throw new Error(`ViewModel实例未找到: ${instanceId}`)
      }
      
      console.log(`👂 添加属性监听器: ${propName}`)
      
      // 添加监听器，将变化转发给渲染进程
      viewModelInstance.addPropertyListener(propName, (changeInfo: PropertyChangeInfo) => {
        console.log(`📡 属性变化: ${changeInfo.propName} = ${changeInfo.value}`)
        
        // 转发给渲染进程
        event.sender.send('mvvm:propertyChanged', {
          instanceId,
          viewId: changeInfo.viewId,
          propName: changeInfo.propName,
          value: changeInfo.value
        })
      })
      
      console.log(`✅ 属性监听器添加成功: ${propName}`)
      return { success: true }
    } catch (error) {
      console.error(`❌ 添加属性监听器失败 (${propName}):`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '添加监听器失败' 
      }
    }
  })

  /**
   * 获取ViewModel状态
   */
  ipcMain.handle('mvvm:getState', async (event, instanceId: string) => {
    try {
      const viewModelInstance = global.viewModelInstances?.get(instanceId)
      if (!viewModelInstance) {
        throw new Error(`ViewModel实例未找到: ${instanceId}`)
      }
      
      console.log(`📊 获取ViewModel状态: ${instanceId}`)
      
      // 使用C++的getState方法
      const state = viewModelInstance.getState()
      
      console.log(`✅ 状态获取成功:`, state)
      return { success: true, state }
    } catch (error) {
      console.error(`❌ 获取ViewModel状态失败:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '获取状态失败' 
      }
    }
  })

  /**
   * 移除ViewModel实例
   */
  ipcMain.handle('mvvm:removeViewModel', async (event, instanceId: string) => {
    try {
      if (global.viewModelInstances?.has(instanceId)) {
        global.viewModelInstances.delete(instanceId)
        console.log(`🗑️ ViewModel实例已移除: ${instanceId}`)
        return { success: true }
      }
      
      console.log(`⚠️ 要移除的ViewModel实例不存在: ${instanceId}`)
      return { success: false, error: '实例不存在' }
    } catch (error) {
      console.error(`❌ 移除ViewModel实例失败:`, error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '移除实例失败' 
      }
    }
  })

  console.log('✅ MVVM处理器注册成功')
}
