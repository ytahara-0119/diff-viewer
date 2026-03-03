import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

export interface ElectronAPI {
  selectFolder: () => Promise<string | null>
  startCompare: (folderA: string, folderB: string) => Promise<void>
  cancelCompare: () => Promise<void>
  onProgress: (cb: (event: IpcRendererEvent, progress: { scanned: number; total: number }) => void) => void
  onResult: (cb: (event: IpcRendererEvent, results: unknown[]) => void) => void
  onError: (cb: (event: IpcRendererEvent, message: string) => void) => void
  removeAllListeners: (channel: string) => void
}

const api: ElectronAPI = {
  selectFolder: () => ipcRenderer.invoke('selectFolder'),
  startCompare: (folderA, folderB) => ipcRenderer.invoke('startCompare', folderA, folderB),
  cancelCompare: () => ipcRenderer.invoke('cancelCompare'),
  onProgress: (cb) => { ipcRenderer.on('compareProgress', cb) },
  onResult: (cb) => { ipcRenderer.on('compareResult', cb) },
  onError: (cb) => { ipcRenderer.on('compareError', cb) },
  removeAllListeners: (channel) => { ipcRenderer.removeAllListeners(channel) }
}

contextBridge.exposeInMainWorld('electronAPI', api)
