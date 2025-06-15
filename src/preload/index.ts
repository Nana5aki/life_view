/*
 * @Author: Nana5aki
 * @Date: 2025-05-30 21:21:48
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-15 17:45:35
 * @FilePath: \life_view\src\preload\index.ts
 */
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 动态加载C++模块
const RequireFunc = eval('require')
const MVVMNative = RequireFunc('../../backend/build/Release/life_view_backend.node')

// Custom APIs for renderer - 创建ViewModel包装器
const api = {
  mvvm: {
    CreateViewModel: (type: string) => {
      try {
        const native_instance = MVVMNative.createViewModel(type)
        // 创建一个包装器对象，显式暴露方法
        const wrapper = {
          GetProp: (propName: string) => {
            return native_instance.GetProp(propName)
          },
          BindProperty: (
            prop_name: string,
            callback: (ChangeInfo: { prop_name: string; value: unknown }) => void
          ) => {
            return native_instance.BindProperty(prop_name, callback)
          },
          ExcuteCommand: (command_name: string, param?: unknown) => {
            if (param !== undefined) {
              return native_instance.ExcuteCommand(command_name, param)
            } else {
              return native_instance.ExcuteCommand(command_name)
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
