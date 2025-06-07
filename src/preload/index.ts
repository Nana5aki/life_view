/*
 * @Author: Nana5aki
 * @Date: 2025-05-30 21:21:48
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-07 12:01:58
 * @FilePath: \life_view\src\preload\index.ts
 */
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 动态加载C++模块
const requireFunc = eval('require')
const mvvmNative = requireFunc('../../backend/build/Release/life_view_backend.node')

// Custom APIs for renderer - 创建ViewModel包装器
const api = {
  mvvm: {
    createViewModel: (type: string) => {
      console.log('创建 ViewModel:', type)
      try {
        const nativeInstance = mvvmNative.createViewModel(type)
        // 创建一个包装器对象，显式暴露方法
        const wrapper = {
          getProp: (propName: string) => {
            return nativeInstance.getProp(propName)
          },
          addPropertyListener: (
            propName: string,
            callback: (changeInfo: { propName: string; value: unknown }) => void
          ) => {
            return nativeInstance.addPropertyListener(propName, callback)
          },
          action: (actionName: string, param?: unknown) => {
            if (param !== undefined) {
              return nativeInstance.action(actionName, param)
            } else {
              return nativeInstance.action(actionName)
            }
          }
        }
        return wrapper
      } catch (error) {
        console.error('ViewModel Create Failed', error)
        throw error
      }
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error('API expose failed:', error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
