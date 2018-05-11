import React, {Component} from 'react';
import classname from 'classname'
import _ from 'lodash'
import {withStyles} from 'material-ui/styles';
import red from 'material-ui/colors/red';
import grey from 'material-ui/colors/grey';
import Grid from 'material-ui/Grid';
import GridList, { GridListTile } from 'material-ui/GridList';
import Menu, { MenuItem } from 'material-ui/Menu';
import Button from 'material-ui/Button';
import Typography from "material-ui/Typography";
import Dialog from 'material-ui/Dialog';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {SketchPicker, HuePicker} from 'react-color'
import { DeviceBox, WarmLightPicker } from './components'

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
  },
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
  operatePanel: {
    padding: '20px 100px',
    boxSizing: 'border-box'
  },
  operateListTile:{
    position: 'relative',
    padding: '20px 0 10px',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    background: grey[200],
    boxSizing: 'border-box'
  },
  tileTitle:{
    padding: '1px 3px',
    position: 'absolute',
    right: '0',
    top: '0',
    fontSize: theme.typography.body2.fontSize,
    color: grey[500],
    background: grey[300],
    borderRadius: '0 0 0 3px'
  },
  colorPanel:{
    margin:'auto'
  },
  powerIcon:{
    fill: grey[500],
    width: '1em',
    height: '1em',
    display: 'inline-block',
    fontSize: 24,
    transition: 'fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    userSelect: 'none',
    flexShrink: 0
  },
  powerOn:{
    fill: red[500]
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
      modalRenameOpen:false, 
      modalOperateOpen:false,
      color:'#fff'
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
    this.setState({
      modalOperateOpen:true
    })
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
      anchorEl:null
    })
  }

  handleModalClose= ()=>{
    this.setState({
      modalOperateOpen:false
    })
  }

  handleColorChanged= (color,event)=>{
    console.log(color);
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

  onChange(color){
    console.log('2',color);
  }

  onChangeComplete(color){
    console.log('1',color);
  }

  render() {    
    const { classes } = this.props
    const {devices, anchorEl, anchorDid, modalOperateOpen, color} = this.state;
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
                <DeviceBox
                  did={device.did}
                  name={device.data['name']}
                  mode={device.data['mode']}
                  ipAddress={device.address}
                  power={device.data['power'] === 'on'}
                  connected={device.connected}
                  onSwitch={state=>this.handlePowerSwitch(device.did,state)}
                  onActionMore={target=>this.handleActionMore(device.did,target)}
                  ></DeviceBox>
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
              anchorDevice && anchorDevice.connected ? <MenuItem onClick={this.handleDeviceRename}>Set Name</MenuItem> : null
            }
            {            
              anchorDevice && anchorDevice.connected ? <MenuItem onClick={this.handleDeviceControl}>Operate</MenuItem> : null
            }
            <MenuItem onClick={this.handleDeviceRemove}>Remove</MenuItem>
          </Menu> 
          <Dialog fullScreen open={modalOperateOpen} onClose={this.handleModalClose}>
            <AppBar className={classes.appBar}>
              <Toolbar>
                <Typography variant="title" color="inherit" className={classes.flex}>{anchorDevice?((anchorDevice.data &&anchorDevice.data['name'])||anchorDevice.address||anchorDevice.did) :'Device Name'}</Typography>
                <IconButton color="inherit" onClick={this.handleModalClose} aria-label="Close">
                  <CloseIcon/>
                </IconButton>
              </Toolbar>
            </AppBar> 
            <div className={classes.operatePanel}>           
              <GridList cellHeight={78} cols={5} spacing={12}>
                <GridListTile cols={1}>
                  <div className={classes.operateListTile}>
                    <span className={classes.tileTitle}>power</span>
                    <IconButton aria-label="Power" onClick={this.handleSwitch}>
                      <svg className={classname(classes.powerIcon,anchorDevice&&anchorDevice.data['power'] === 'on'&&classes.powerOn)}  viewBox="0 0 15 15" focusable="false">
                        <g>
                          <path d="M10.5,1.674V4c1.215,0.912,2,2.364,2,4c0,2.762-2.238,5-5,5s-5-2.238-5-5c0-1.636,0.785-3.088,2-4
                            V1.674C2.135,2.797,0.5,5.208,0.5,8c0,3.866,3.134,7,7,7s7-3.134,7-7C14.5,5.208,12.865,2.797,10.5,1.674z"/>
                          <path d="M8.5,7.003V0.997C8.5,0.446,8.056,0,7.5,0c-0.553,0-1,0.453-1,0.997v6.006C6.5,7.554,6.944,8,7.5,8
                            C8.053,8,8.5,7.547,8.5,7.003z"/>
                        </g>
                      </svg>           
                    </IconButton>
                  </div>
                </GridListTile>
                <GridListTile cols={4}>
                  <div className={classes.operateListTile}>
                    <span className={classes.tileTitle}>brightness</span>
                    <HuePicker onChange={this.onChange} onChangeComplete={this.onChangeComplete}></HuePicker>
                    <WarmLightPicker onChange={this.onChange}></WarmLightPicker>
                  </div>
                </GridListTile>
                <GridListTile rows={5} cols={1}>
                  <div className={classes.operateListTile}>
                    <span className={classes.tileTitle}>white</span>
                  
                  </div>
                </GridListTile>
                <GridListTile rows={5} cols={3}>
                  <div className={classes.operateListTile}>
                    <span className={classes.tileTitle}>color</span>
                    <SketchPicker color={color} width={300} disableAlpha={true} className={classes.colorPanel}  onChangeComplete={this.handleColorChanged}>
                    </SketchPicker>
                  </div>
                </GridListTile>
                <GridListTile rows={5} cols={1}>
                  <div className={classes.operateListTile}>
                    <span className={classes.tileTitle}>flow</span>
                  </div>
                </GridListTile>
              </GridList>
            </div>
          </Dialog>  
        </div>
      </div>
    );
  }
}

export default  withStyles(styles)(App);
