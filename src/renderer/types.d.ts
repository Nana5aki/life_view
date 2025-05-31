/// <reference types="react" />
/// <reference types="react-dom" />

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke: (channel: string, ...args: unknown[]) => Promise<any>
        on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void
        removeListener: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void
        send: (channel: string, ...args: unknown[]) => void
      }
    }
    api: unknown
  }
} 