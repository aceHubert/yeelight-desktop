const path = require('path')
const url = require('url')
const _ = require('lodash')
// 引入electron并创建一个Browserwindow
const {app, BrowserWindow, ipcMain} = require('electron')
const ControlClient = require('./ControlClient')

const isDev = require('electron-is-dev');
const kIP = "239.255.255.250";
const kPort = 1982;

// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow
let controlClient

// 创建主窗体
function createWindow() {
  //创建浏览器窗口,宽高自定义具体大小你开心就好
  mainWindow = new BrowserWindow({width: 1120, height: 768, backgroundColor: '#fff'})

  // 加载应用----适用于 react 项目
  mainWindow.loadURL(isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`);

  // 打开开发者工具 
  // isDev && mainWindow.webContents.openDevTools()

  //搜索设备
  controlClient.scan();

  // 关闭window时触发下列事件.
  mainWindow.on('closed', function () {
    mainWindow = null
  })

}

// 发送消息到渲染客户端
function sendToRenderer(channel, msg) {
  mainWindow && mainWindow
    .webContents
    .send(channel, msg);
}

// 接收渲染客户端消息 
// ::第一次页面加载获取一次设备
ipcMain.on('get-devices', (event, arg) => {
  event.returnValue = _.map(controlClient.leds, led => ({
    did: led.did, 
    address: led.location, 
    connected: led.connected, 
    data: led.data 
  }))
})
// ::设备的请求
ipcMain.on('request', (event, arg) => {
  console.log(arg)
  switch (arg.type) {
    case 'scan':
      controlClient.scan();
      break;
    case 'connect':
      controlClient.connectDevice(arg.did);
      break;
    case 'command':
      controlClient.sendCommand(arg.did, arg.guid, arg.method, arg.params);
      break;
  }

})

// 初始化客户端
function initClient() {
  var cc = new ControlClient({address: kIP, port: kPort});

  cc.onInfo = function (message) {
    console.log(message);
  };

  cc.onAddDevice = function (did, location, data) {
    console.log(did,location)
    sendToRenderer('report', {
      type: 'add-device',
      config: {
        did,
        address: location,
        connected: false,
        data
      }
    })
  };

  cc.onNotify = function (data) {
    console.log(data)
    sendToRenderer('report', {
      type: 'notify',
      data
    })
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

// 窗口处理活动状态时
app.on('activate', function () {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow()
  }
})
