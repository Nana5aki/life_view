/*
 * @Author: Nana5aki
 * @Date: 2025-05-30 21:21:48
 * @LastEditors: Nana5aki
 * @LastEditTime: 2025-06-15 17:45:20
 * @FilePath: \life_view\src\preload\index.d.ts
 */
import { ElectronAPI } from '@electron-toolkit/preload'

// ViewModel实例接口
interface ViewModelInstance {
  GetProp(prop_name: string): unknown
  BindProperty(
    prop_name: string,
    callback: (ChangeInfo: { prop_name: string; value: unknown }) => void
  ): void
  ExcuteCommand(command_name: string, param?: unknown): void
}

// MVVM API接口
interface MVVMAPI {
  CreateViewModel(type: string): ViewModelInstance
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      mvvm: MVVMAPI
    }
  }
}
