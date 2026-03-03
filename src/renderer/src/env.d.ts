/// <reference types="vite/client" />

import type { IpcRendererEvent } from 'electron'

interface ElectronAPI {
  selectFolder: () => Promise<string | null>
  startCompare: (folderA: string, folderB: string) => Promise<void>
  cancelCompare: () => Promise<void>
  onProgress: (cb: (event: IpcRendererEvent, progress: { scanned: number; total: number }) => void) => void
  onResult: (cb: (event: IpcRendererEvent, results: unknown[]) => void) => void
  onError: (cb: (event: IpcRendererEvent, message: string) => void) => void
  removeAllListeners: (channel: string) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
