const { app, BrowserWindow } = require('electron')

const mainWinURL = "http://localhost:8080/"

function createWindow () {
  // Crea la ventana del navegador.
  let win = new BrowserWindow({
    width: 1800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // y carga el  index.html de la aplicación.
  win.loadURL(mainWinURL)
}

app.whenReady().then(createWindow)
