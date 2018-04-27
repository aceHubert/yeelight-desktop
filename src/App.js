import React, { Component } from 'react';
const { ipcRenderer } = window.require('electron');

class App extends Component {

  constructor(props){
    super(props)

    this.state={
      devices:[]
    }
  }

  componentDidMount(){
    //页面渲染后获取一次设备列表
    ipcRenderer.send('request',{
      type:'get-devices'
    });

    //监听主进程消息
    ipcRenderer.on('report', (event, arg) => {
      console.log(arg)
      switch (arg.type)
      {
        case 'add-device': // 添加设备，在页面渲染完成后获取到设备
          this.setState({
            devices: this.state.devices.concat(arg.config)
          });
          break;
        case 'get-devices': //添加设备，在渲染进程未完成就已经获取到的设备
          if(arg.devices)
          {
            let newDevices = this.state.devices.filter(device=>device.did !== key)
            this.setState({
              devices: this.state.devices.concat(newDevices)
            });
          }
          break;
        case 'notify': // 设备消息
          
          break;
      }
    })
  }

  //连接设备
  handleConnectDevice=(did)=>{
    ipcRenderer.send('request',{
      type:'connect',
      did: did
    })
  }

  //发送命令
  handleCommand=(did, command, params)=>{
    ipcRenderer.send('request',{
      type:'command',
      command,
      params
    })
  }


  render() {
    const { devices } = this.state;
    return (
      <div className="app">
        <header className="app-header">
          <img src={require('./images/ic_locale_plugin.png')} className="app-header__logo" alt="logo" />
          <h1 className="app-header__title">Yeelight for desktop</h1>
        </header>
        <div className="app-container">
          <ul className="app-devices">
          {
            devices.map((device,inx)=>{
              return <li key={inx} className="app-device" onClick={this.handleConnectDevice.bind(this,device.id)}>
              <img src={require('./images/icon_yeelight_scene_type_1.png')} alt="icon" className="app-device" />
              <p className="app-device__name">{device.data.name || device.address}</p>
              </li>
            }) 
             
          }
          {
            devices.length < 8?
            Array.from({length: 8- devices.length}).map((item,index)=>{
              return <li key={index} className="app-device"></li>
            }):null         
          }
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
