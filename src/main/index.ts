import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { compareDirectories, cancelCompare, DiffEntry } from './compareEngine'

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#ffffff'
  })

  // Load renderer
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// IPC: Select folder via native dialog
ipcMain.handle('selectFolder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  })
  if (result.canceled || result.filePaths.length === 0) return null
  return result.filePaths[0]
})

// IPC: Start comparison
ipcMain.handle('startCompare', async (event, folderA: string, folderB: string) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return

  try {
    const results: DiffEntry[] = await compareDirectories(
      folderA,
      folderB,
      (progress) => {
        if (!win.isDestroyed()) {
          win.webContents.send('compareProgress', progress)
        }
      }
    )
    if (!win.isDestroyed()) {
      win.webContents.send('compareResult', results)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (!win.isDestroyed()) {
      win.webContents.send('compareError', message)
    }
  }
})

// IPC: Cancel comparison
ipcMain.handle('cancelCompare', () => {
  cancelCompare()
})
