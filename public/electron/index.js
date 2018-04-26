const path = require('path')
const url = require('url')
// 引入electron并创建一个Browserwindow
const { app, BrowserWindow, ipcMain } = require('electron')
const ControlClient = require('./ControlClient')


const isDev = require('electron-is-dev');
const kIP = "239.255.255.250";
const kPort = 1982;

// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow
let controlClient

function createWindow() {
  //创建浏览器窗口,宽高自定义具体大小你开心就好
  mainWindow = new BrowserWindow({ width: 1120, height: 768 })

  // 加载应用----适用于 react 项目
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);

  // 打开开发者工具
  // isDev && mainWindow.webContents.openDevTools()
 
  mainWindow.webContents.on('dom-ready', function () {
    controlClient.scan();
  })
 
  // 关闭window时触发下列事件.
  mainWindow.on('closed', function () {
    mainWindow = null
  })

}

// 发送消息到渲染客户端
function sendToRenderer(channel, msg) {
  mainWindow && mainWindow.webContents.send(channel, msg);
}

// 接收渲染客户端消息
ipcMain.on('command', (event, arg) => {
  console.log(arg)
  switch (arg.type) {
    case 'scan':
      controlClient.scan();
      break;
  }
  // event.sender.send('asynchronous-reply', 'pong')
})

// 初始化客户端
function initClient() {
  var cc = new ControlClient({
    address: kIP,
    port: kPort
  });

  cc.onAddDevice = function (did, location, props) {
    sendToRenderer('report', {
      type: 'add-drive',
      config: {
        id: did,
        address: location,
        props
      }
    })
  };
  cc.onResult = function (result) {
  };
  cc.onInfo = function (message) {
    console.log(message);
  };
  cc.onDevResponse = function (data) {
    console.log(data);
  };
  cc.onDevResponse = function (error) {
    console.log(error);
  };
  controlClient = cc;
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready', () => {
  initClient();
  createWindow();
})

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow()
  }
})