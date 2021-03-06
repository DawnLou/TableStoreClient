import {app, BrowserWindow, ipcMain, Menu, MenuItem} from 'electron';
import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer';
import {enableLiveReload} from 'electron-compile';
import TableStore from 'tablestore'


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload();

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, minWidth: 800, height: 600, minHeight: 600});
  if (process.platform === 'darwin' && !isDevMode) {
    const template = [
      {
        label: "Application",
        submenu: [
          {
            label: "Quit", accelerator: "Command+Q", click: function () {
              app.quit();
            }
          }
        ]
      },
      {
        label: "Edit",
        submenu: [
          {label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:"},
          {label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:"},
        ]
      }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  }
  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(VUEJS_DEVTOOLS);
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.on('info', (event, ...args) => {
  console.info('[WEB][INFO]', ...args)
});
ipcMain.on('debug', (event, ...args) => {
  console.debug('[WEB][DEBUG]', ...args)
});
ipcMain.on('warn', (event, ...args) => {
  console.warn('[WEB][WARN]', ...args)
});
ipcMain.on('error', (event, ...args) => {
  console.error('[WEB][ERROR]', ...args)
});

ipcMain.on('list-table', (event, req) => {
  new TableStore.Client(req.data).listTable({}, (err, data) => {
      event.sender.send(req.replyChannel, err ? {message: err.message, stack: err.stack, code: err.code} : null, data)
    }
  )
});

ipcMain.on('describe-table', (event, req) => {
  new TableStore.Client(req.data.conf).describeTable({tableName: req.data.tableName}, (err, data) => {
      event.sender.send(req.replyChannel, err ? {message: err.message, stack: err.stack, code: err.code} : null, data
      )
    }
  )
});

ipcMain.on('get-range', (event, req) => {
  // console.info(req)
  let start = []
  let end = []
  req.data.cond.start.forEach((item, index) => {
    for (let key in item) {
      const val = item[key]
      if (val) {
        start.push(item)
        return
      }
      if (req.data.cond.direction === TableStore.Direction.FORWARD) {
        item[key] = TableStore.INF_MIN
        start.push(item)
        return
      }
      item[key] = TableStore.INF_MAX
      start.push(item)
      return
    }
  })
  req.data.cond.end.forEach((item, index) => {
    for (let key in item) {
      const val = item[key]
      if (val) {
        end.push(item)
        return
      }
      if (req.data.cond.direction === TableStore.Direction.FORWARD) {
        item[key] = TableStore.INF_MAX
        end.push(item)
        return
      }
      item[key] = TableStore.INF_MIN
      end.push(item)
      return
    }
  })
  // console.info(...start);
  // console.info(...end);
  new TableStore.Client(req.data.conf).getRange({
      tableName: req.data.cond.tableName,
      direction: req.data.cond.direction,
      inclusiveStartPrimaryKey: start,
      exclusiveEndPrimaryKey: end,
      limit: req.data.cond.limit
    }, (err, data) => {
      event.sender.send(req.replyChannel, err ? {
        message: err.message,
        stack: err.stack,
        code: err.code
      } : null, JSON.parse(JSON.stringify(data)));
    }
  )
});

const isInt64 = (meta, name) => {
  for (let i = 0; i < meta.primary_key.length; i++) {
    const item = meta.primary_key[i];
    if (item.name === name && item.type === TableStore.PrimaryKeyType.INTEGER) return true;
  }
  return false;
}

ipcMain.on("dump-instance", (event, req) => {
  const conf = req.data.conf;
  const meta = req.data.meta;
  const from = req.data.from;
  const table = req.data.table;
  const start = [];
  const end = [];
  const pkmeta = meta.primary_key;
  if (from) {
    for (let i = 0; i < from.length; i++) {
      const pk = {};
      const item = from[i];
      const name = item.name;
      const value = item.value;
      pk[name] = isInt64(meta, name) ? TableStore.Long.fromNumber(value) : value;
      start.push(pk);
    }
    for (let j = 0; j < pkmeta.length; j++) {
      let pk = {};
      const item = pkmeta[j];
      pk[item.name] = TableStore.INF_MAX;
      end.push(pk);
    }
  } else {
    for (let j = 0; j < pkmeta.length; j++) {
      let pk1 = {};
      let pk2 = {};
      const item = pkmeta[j];
      pk1[item.name] = TableStore.INF_MIN;
      pk2[item.name] = TableStore.INF_MAX;
      start.push(pk1)
      end.push(pk2);
    }
  }
  new TableStore.Client(conf).getRange({
      tableName: table,
      direction: TableStore.Direction.FORWARD,
      inclusiveStartPrimaryKey: start,
      exclusiveEndPrimaryKey: end,
      limit: 5000
    }, (err, data) => {
      event.sender.send(req.replyChannel, err ? {
        message: err.message,
        stack: err.stack,
        code: err.code
      } : null, JSON.parse(JSON.stringify(data)))
    }
  )
});
