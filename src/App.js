import React, { Component } from 'react';
import classname from 'classname';

const os = window.require('os');
const { ipcRenderer } = window.require('electron');

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      devices: []
    }
  }

  componentDidMount() {
    //页面渲染后获取一次设备列表
    ipcRenderer.send('request', {
      type: 'get-devices'
    });

    //监听主进程消息
    ipcRenderer.on('report', (event, arg) => {
      console.log(arg)
      switch (arg.type) {
        case 'add-device': // 添加设备，在页面渲染完成后获取到设备
          this.setState({
            devices: this.state.devices.concat(arg.config)
          }, () => {
            this.handleConnectDevice(arg.config.did);
          });
          break;
        case 'get-devices': //添加设备，在渲染进程未完成就已经获取到的设备
          if (arg.devices) {
            const newDevices = arg.devices.filter(device => !this.state.devices.some(device => device.did === device.did));
            this.setState({
              devices: this.state.devices.concat(newDevices)
            }, () => {
              newDevices.forEach(device => {
                !device.connected && this.handleConnectDevice(device.did);
              });
            });
          }
          break;
        case 'notify': // 设备消息
          const { did, method, params } = arg.data;
          const deviceIndex = this.state.devices.findIndex(device => device.did === did);
          const device = this.state.devices[deviceIndex];
          if (method) {
            switch (method) {
              case 'connect':
                device.connected = !!params;
                break;
              case 'props':
                Object.assign(device.data, params);
                break;
            }
            this.setState({
              devices: this.state.devices
            })
          }
          break;
      }
    })
  }

  powerSwitch = (did, state) => {
    //{ "id": 1, "method": "set_power", "params":["on", "smooth", 500]}
    this.handleCommand(did, 1, 'set_power', [state, 'smooth', 500]);
  }

  //连接设备
  handleConnectDevice = (did) => {
    ipcRenderer.send('request', {
      type: 'connect',
      did
    })
  }

  //发送命令
  handleCommand = (did, guid, method, params) => {
    ipcRenderer.send('request', {
      type: 'command',
      did,
      guid,
      method,
      params
    })
  }


  render() {
    const { devices } = this.state;
    const osType = os.type();
    const osStr = osType === 'Linux'? 'Linux':
                  osType === 'Darwin'? 'Mac' : 'Windows'
    return (
      <div className="app">
        <header className="app-header">
          <img src={require('./images/ic_locale_plugin.png')} className="app-header__logo" alt="logo" />
          <h1 className="app-header__title">Yeelight for {osStr}</h1>
        </header>
        <div className="app-container">
          <ul className="app-devices">
            {
              devices.map((device, inx) => {
                return <li key={inx} className={classname('app-device',!device.connected && 'app-device--offline')}>
                  <img src={require('./images/icon_yeelight_scene_type_1.png')} alt="icon" className="app-device__icon" />
                  <p className="app-device__name">{device.data.name || device.address}</p>
                  <a href="javascript:" className="app-device__power" onClick={this.powerSwitch.bind(this, device.did, device.data.power === 'on' ? 'off' : 'on')}>
                    <img src={device.data.power === 'on' ? require('./images/icon_yeelight_device_list_on.png') : require('./images/icon_yeelight_device_list_off.png')} alt="power" />
                  </a>
                </li>
              })

            }
            {
              devices.length < 10 ?
                Array.from({ length: 10 - devices.length }).map((item, index) => {
                  return <li key={index} className="app-device"></li>
                }) : null
            }
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
