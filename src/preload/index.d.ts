import { ElectronAPI } from '@electron-toolkit/preload'

// ViewModel实例接口
interface ViewModelInstance {
  getProp(propName: string): unknown
  addPropertyListener(propName: string, callback: (changeInfo: { propName: string; value: unknown }) => void): void
  action(actionName: string, param?: unknown): void
}

// MVVM API接口
interface MVVMAPI {
  createViewModel(type: string): ViewModelInstance
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      mvvm: MVVMAPI
    }
  }
}
