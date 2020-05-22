import { BrowserWindow, Tray, app } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
import debug from 'electron-debug'

const isDevelopment = process.env.NODE_ENV !== 'production'

debug()

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow
let tray

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    frame: false,
    resizable: false,
    show: false,
    webPreferences: { nodeIntegration: true },
  })
  console.log({ isDevelopment })

  // if (isDevelopment) {
  //   mainWindow.webContents.openDevTools()
  // }

  if (isDevelopment) {
    console.log(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    mainWindow.loadURL(
      `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`
    )
  } else {
    mainWindow.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })
    )
  }

  mainWindow.on('closed', () => (mainWindow = null))
  mainWindow.on('blur', () => mainWindow.hide())

  const iconPath = path.join(__dirname, './IconTemplate.png')
  tray = new Tray(iconPath)
  tray.on('click', (event, bounds) => {
    const { x, y } = bounds
    const { height, width } = mainWindow.getBounds()
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.setBounds({
        x: x - width / 2,
        y,
        height,
        width,
      })
      mainWindow.show()
    }
  })

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.focus()
    setImmediate(() => {
      mainWindow.focus()
    })
  })

  return mainWindow
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (!mainWindow) {
    mainWindow = createMainWindow()
  }
})

// create main mainWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})
