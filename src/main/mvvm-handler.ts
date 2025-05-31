/*
 * @Author: Nana5aki
 * @Date: 2025-05-31 18:11:43
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-01 01:15:14
 * @FilePath: \life_view\src\main\mvvm-handler.ts
 */
import { ipcMain } from 'electron'

// Define types
interface ViewModelInstance {
  getViewId(): string;
  action(actionName: string, ...args: unknown[]): unknown;
  addPropertyListener(propName: string, callback: (changeInfo: PropertyChangeInfo) => void): void;
  getState(): unknown;
}

interface PropertyChangeInfo {
  viewId: string;
  propName: string;
  value: unknown;
}

let mvvmNative: {
  createViewModel: (type: string) => ViewModelInstance;
} | null = null

// Initialize MVVM native module
function initMVVM(): typeof mvvmNative {
  if (!mvvmNative) {
    try {
      // Dynamic loading with eval to avoid TypeScript/linter issues
      const requireFunc = eval('require')
      mvvmNative = requireFunc('../../backend/build/Release/life_view_backend.node')
      console.log('MVVM native module loaded successfully')
    } catch (error) {
      console.error('Failed to load MVVM native module:', error)
      throw error
    }
  }
  return mvvmNative
}

export function registerMVVMHandlers(): void {
  // Create ViewModel - returns a ViewModel instance directly
  ipcMain.handle('mvvm:createViewModel', async (event, viewModelType: string) => {
    try {
      const mvvm = initMVVM()
      if (!mvvm) {
        throw new Error('Failed to initialize MVVM native module')
      }
      
      const viewModelInstance = mvvm.createViewModel(viewModelType)
      
      // Store the instance reference in the renderer process
      // We'll return a unique ID and keep the instance in main process
      const instanceId = `vm_${Date.now()}_${Math.random()}`
      
      // Store instance for future reference
      if (!global.viewModelInstances) {
        global.viewModelInstances = new Map()
      }
      global.viewModelInstances.set(instanceId, viewModelInstance)
      
      return {
        success: true,
        instanceId: instanceId,
        viewId: viewModelInstance.getViewId()
      }
    } catch (error) {
      console.error('Error creating ViewModel:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  })

  // Execute action on ViewModel instance
  ipcMain.handle('mvvm:executeAction', async (event, instanceId: string, actionName: string, ...args: unknown[]) => {
    try {
      const viewModelInstance = global.viewModelInstances?.get(instanceId)
      if (!viewModelInstance) {
        throw new Error(`ViewModel instance not found: ${instanceId}`)
      }
      
      console.log(`Executing action: ${actionName} with args:`, args)
      
      // Call the action method with actionName and all args
      const result = viewModelInstance.action(actionName, ...args)
      return { success: true, result }
    } catch (error) {
      console.error('Error executing action:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  })

  // Add property listener to ViewModel instance
  ipcMain.handle('mvvm:addPropertyListener', async (event, instanceId: string, propName: string) => {
    try {
      const viewModelInstance = global.viewModelInstances?.get(instanceId)
      if (!viewModelInstance) {
        throw new Error(`ViewModel instance not found: ${instanceId}`)
      }
      
      // Add listener that forwards changes to renderer
      viewModelInstance.addPropertyListener(propName, (changeInfo: PropertyChangeInfo) => {
        // Forward property change to renderer process
        event.sender.send('mvvm:propertyChanged', {
          instanceId,
          ...changeInfo
        })
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error adding property listener:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  })

  // Get ViewModel state
  ipcMain.handle('mvvm:getState', async (event, instanceId: string) => {
    try {
      const viewModelInstance = global.viewModelInstances?.get(instanceId)
      if (!viewModelInstance) {
        throw new Error(`ViewModel instance not found: ${instanceId}`)
      }
      
      const state = viewModelInstance.getState()
      return { success: true, state }
    } catch (error) {
      console.error('Error getting state:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  })

  // Remove ViewModel instance
  ipcMain.handle('mvvm:removeViewModel', async (event, instanceId: string) => {
    try {
      if (global.viewModelInstances?.has(instanceId)) {
        global.viewModelInstances.delete(instanceId)
        return { success: true }
      }
      return { success: false, error: 'Instance not found' }
    } catch (error) {
      console.error('Error removing ViewModel:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  })

  console.log('MVVM handlers registered successfully')
}
