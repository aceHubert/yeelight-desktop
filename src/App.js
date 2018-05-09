import React, {Component} from 'react';
import _ from 'lodash'
import {withStyles} from 'material-ui/styles';
import grey from 'material-ui/colors/grey';
import Grid from 'material-ui/Grid';
import Menu, { MenuItem } from 'material-ui/Menu';
import Button from 'material-ui/Button';
import Typography from "material-ui/Typography";
import { Device } from './components'

const os = window.require('os');
const {ipcRenderer} = window.require('electron');

const styles = theme =>({
  noDevice:{  
    padding:'100px 50px',
    textAlign: 'center'
  },
  networkNotify:{
    marginBottom:50,
    color:grey[700]
  }
})

class App extends Component {

  commands=[];
  constructor(props) {
    super(props)

    this.state = {
      devices: [],
      anchorDid: null,
      anchorEl: null,
    }
  }

  componentWillMount(){
    //监听主进程消息
    ipcRenderer.on('report', (event, arg) => {
      console.log(arg)
      switch (arg.type) {
        case 'add-devices':
          const devices = _.map(arg.devices,device=>({did:device.did, address:device.address, connected:Boolean(device.connected), data:device.data||{}}));
          this.setState({
            devices: this.state.devices.concat(devices)
          }, () => {
            devices.forEach(device=>{
              this.connectDevice(device.did);
            })          
          });
          break;
        case 'notify': // 设备消息
          const {did, type, params, error} = arg.data;
          const device = this.state.devices.find(device => device.did === did);
          switch (type) {
            case 'connect':
              device.connected = true;
              break;
            case 'disconnect':
              device.connected = false;
              break;
            case 'props':
              Object.assign(device.data, params);
              break;
            case 'error':
              console.error(error);
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }
    })
  }

  componentDidMount() {   
    this.loadDevices();   
  }

  handleScanDevices = ()=>this.scanDevices()

  handlePowerSwitch = (did, state) => {
    //{ "id": 1, "method": "set_power", "params":["on", "smooth", 500]}
    this.sendCommand(did, 'set_power', [state?'on':'off', 'smooth', 500]);
  }

  handleActionMore = (did, target) => {
    this.setState({
      anchorDid:did,
      anchorEl:target
    })
  }

  handleDeviceRename= ()=>{

    this.handleMenuClose();
  }

  handleDeviceControl = ()=>{

    this.handleMenuClose();
  }

  handleDeviceRemove = ()=>{
    const { devices, anchorDid } = this.state;
    const deviceIndex = devices.findIndex(device=>device.did === anchorDid);
    devices.splice(deviceIndex,1)
    this.setState({
      devices: devices
    })
    this.removeDevice(anchorDid)
    this.handleMenuClose();
  }

  handleMenuClose = ()=>{
    this.setState({
      anchorDid:null,
      anchorEl:null
    })
  }

  //从本地加载设备
  loadDevices = ()=>{
    ipcRenderer.send('request',{
      type:'get-devices'
    });
  }

  //搜索设备
  scanDevices = () => {
    ipcRenderer.send('request', {
      type: 'scan'
    })
  }

  //连接设备
  connectDevice = (did) => {
    ipcRenderer.send('request', {
      type: 'connect',
      did
    })
  }

  //移出设备
  removeDevice = (did) => {
    ipcRenderer.send('request', {
      type: 'remove',
      did
    })
  }

  //发送命令
  sendCommand = (did, method, params) => {
    const command =  {
      did,
      guid: this.commands.length+1,
      method,
      params
    }
    this.commands.push(command);
    ipcRenderer.send('request',Object.assign({ type: 'command'},command) );
  }

  render() {    
    const { classes } = this.props
    const {devices, anchorEl, anchorDid} = this.state;
    const anchorDevice = anchorDid && devices.find(device=>device.did === anchorDid);
    const osType = os.type();
    const osStr = osType === 'Linux' ? 'Linux' : 
          osType === 'Darwin' ? 'Mac' : 'Windows'
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-header__title">Yeelight for {osStr}</h1>
        </header>
        <div className="app-container">
        {
          devices.length > 0 ?
          <Grid container spacing={24}>
            {              
              devices.map((device, index) => (
              <Grid item sm={12} md={6} lg={4} key={index}>
                <Device
                  did={device.did}
                  name={device.data['name']}
                  mode={device.data['mode']}
                  ipAddress={device.address}
                  power={device.data['power'] === 'on'}
                  connected={device.connected}
                  onSwitch={state=>this.handlePowerSwitch(device.did,state)}
                  onActionMore={target=>this.handleActionMore(device.did,target)}
                  ></Device>
              </Grid>
            ))
          }
          </Grid> : <div className={classes.noDevice}>
            <Typography variant="headline" className={classes.networkNotify}>Make sure the bulbs are in same network with your computer.</Typography>
            <Button variant="raised" color="primary" onClick={this.handleScanDevices} >
              Search Devices
            </Button>
          </div>
        }  
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={this.handleMenuClose}
            >
            {
              anchorDevice && anchorDevice.connected ? <MenuItem onClick={this.handleDeviceRename}>Rename</MenuItem> : null
            }
            {            
              anchorDevice && anchorDevice.connected ? <MenuItem onClick={this.handleDeviceControl}>Control</MenuItem> : null
            }
            <MenuItem onClick={this.handleDeviceRemove}>Remove</MenuItem>
          </Menu>   
        </div>
      </div>
    );
  }
}

export default  withStyles(styles)(App);
