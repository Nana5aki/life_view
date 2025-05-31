import { ipcMain, BrowserWindow } from 'electron'
import { join } from 'path'

// 动态加载C++ addon
let addon: any = null
let propertyChangeCallback: ((data: any) => void) | null = null

try {
  // 加载编译后的C++ addon
  addon = require(join(__dirname, '../../backend/build/Debug/life_view_backend.node'))
  console.log('MVVM C++ addon loaded successfully')
} catch (error) {
  console.error('Failed to load MVVM C++ addon:', error)
  // 尝试Release版本
  try {
    addon = require(join(__dirname, '../../backend/build/Release/life_view_backend.node'))
    console.log('MVVM C++ addon (Release) loaded successfully')
  } catch (releaseError) {
    console.error('Failed to load MVVM C++ addon (Release):', releaseError)
  }
}

// 设置属性变化回调的包装函数
function setupPropertyChangeCallback(window: BrowserWindow) {
  if (!addon) return

  const callback = (changeInfo: any) => {
    console.log('Property changed:', changeInfo)
    // 发送到前端
    window.webContents.send('mvvm-property-changed', changeInfo)
  }

  try {
    addon.setPropertyChangedCallback(callback)
    propertyChangeCallback = callback
    console.log('Property change callback set successfully')
  } catch (error) {
    console.error('Failed to set property change callback:', error)
  }
}

export function initMVVMHandlers(): void {
  if (!addon) {
    console.warn('MVVM addon not available, skipping IPC handlers')
    return
  }

  // 设置属性变化监听器
  ipcMain.handle('mvvm-set-callback', async (event) => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (window) {
      setupPropertyChangeCallback(window)
    }
    return { success: true }
  })

  // 执行ViewModel Action
  ipcMain.handle('mvvm-execute-action', async (event, viewModelName: string, actionName: string, ...args: any[]) => {
    try {
      console.log(`Executing action: ${viewModelName}.${actionName}`, args)
      const result = addon.executeAction(viewModelName, actionName, ...args)
      return { success: true, result }
    } catch (error) {
      console.error('Failed to execute action:', error)
      throw error
    }
  })

  // 获取ViewModel状态
  ipcMain.handle('mvvm-get-state', async (event, viewModelName: string) => {
    try {
      const state = addon.getViewModelState(viewModelName)
      return state
    } catch (error) {
      console.error('Failed to get ViewModel state:', error)
      throw error
    }
  })

  // 获取所有ViewModels
  ipcMain.handle('mvvm-get-all', async (event) => {
    try {
      const allViewModels = addon.getAllViewModels()
      console.log('All ViewModels:', allViewModels)
      return allViewModels
    } catch (error) {
      console.error('Failed to get all ViewModels:', error)
      throw error
    }
  })

  console.log('MVVM IPC handlers initialized')
} 