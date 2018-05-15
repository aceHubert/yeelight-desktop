const path = require('path')
const fs = require('fs')
const _ = require('lodash')
// 引入electron并创建一个Browserwindow
const electron = require('electron')
const  {app, BrowserWindow, ipcMain, Menu} = electron
const ControlClient = require('./ControlClient')

const isDev = require('electron-is-dev');
const configDir = path.join(__dirname,'..','config');
const configFilePath = path.resolve(configDir, 'config.conf'); 
const kIP = "239.255.255.250";
const kPort = 1982;


// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow
let controlClient
let config = {
  theme:'light',
  devices:[]
}

// 创建主窗体
function createWindow() {
  //创建浏览器窗口,宽高自定义具体大小你开心就好
  mainWindow = new BrowserWindow({width: 1120, height: 768, minWidth: 768, minHeight: 600, title: 'Yeelight Desktop', backgroundColor: '#fff'})

  // 加载应用----适用于 react 项目
  mainWindow.loadURL(isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`);

  // 打开开发者工具 
  //isDev && mainWindow.webContents.openDevTools() 
  
  let menuTemplate = [{
    label: 'File',
    submenu: [{
      label: 'Exit',
      role: 'quit'
    }]
  }, {
    label: 'Device',
    submenu:[{
      label: 'Scan',
      click:()=>{
        controlClient.scan();
      }
    }]
  }, {
    label: 'View',
    submenu: [{
      label: 'Reload',
      role: 'reload'
    }, {
      label: 'Force Reload',
      role: 'forcereload'
    }, {
      label: 'Dev Tools',
      role: 'toggledevtools'
    }]
  }]
  let menu = Menu.buildFromTemplate(menuTemplate)
  mainWindow.setMenu(menu)

  //关闭window时触发下列事件.
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

// 设备的请求
ipcMain.on('request', (event, arg) => {
  console.log(arg)
  switch (arg.type) {
    case 'scan':
      controlClient.scan();
      break;
    case 'get_config':   
      fs.readFile(configFilePath,'utf-8',(err,data)=>{
        if(!err){
          config = JSON.parse(data.toString());
        }else if(err.code==='ENOENT'){         
          saveConfig();
        }
        sendToRenderer('report', {
          type: 'get_config',
          config
        })
      });     
      break;
    case 'set_theme':
      if(config.theme != arg.theme)
      {
        config.theme = arg.theme;
        saveConfig();
      }
      break;
    case 'connect':
      const device = config.devices.find(device=>device.did=== arg.did);
      if(device)
        controlClient.connectDevice(device.did,device.address);
      break;
    case 'remove':
      const deviceIndex = config.devices.findIndex(device=>device.did===arg.did);
      config.devices.splice(deviceIndex,1);
      saveConfig();
      break;
    case 'command':
      controlClient.sendCommand(arg.did, arg.guid, arg.method, arg.params);
      break;
  }

})

// 保存配置文件
function  saveConfig() {
  fs.writeFile(configFilePath,JSON.stringify(config,null,2),(err)=>{console.error(err)});
}

// 初始化客户端
function initClient() {
  var cc = new ControlClient({address: kIP, port: kPort});

  cc.onInfo = function (message) {
    console.log(message);
  };

  cc.onAddDevice = function (did, location, data) {
    console.log(did, location)
    config.devices.push({
      did,
      address:location
    })
    saveConfig()
    sendToRenderer('report', {
      type: 'add-devices',
      devices: [{
        did,
        address: location,
        connected: false,
        data
      }]
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
  //创建配置文件夹
  if(!fs.existsSync(configDir))
  {
    fs.mkdirSync(configDir)
  }

  initClient();
  createWindow();

  //系统即将被挂起
  electron.powerMonitor.on('suspend',()=>{
    console.log('The system is going to sleep');
  })
  //系统恢复
  electron.powerMonitor.on('resume',()=>{
    //恢复后重新连接
    _.map(config.devices,device=>{
      controlClient.connectDevice(device.did,device.address);
    })
  })
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
