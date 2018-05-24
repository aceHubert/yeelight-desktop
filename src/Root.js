import React, {Component} from 'react'
import classnames from 'classnames'
import _ from 'lodash'
import Grid from '@material-ui/core/Grid'
import GridList from '@material-ui/core/GridList'
import GridListTile from '@material-ui/core/GridListTile'
import Menu  from '@material-ui/core/Menu'
import MenuItem  from '@material-ui/core/MenuItem'
import Button from '@material-ui/core/Button'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Typography from '@material-ui/core/Typography'
import Dialog from '@material-ui/core/Dialog'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import CloseIcon from '@material-ui/icons/Close'
import {withStyles} from '@material-ui/core/styles'
import red from '@material-ui/core/colors/red'
import { Slider } from 'material-ui-slider'
import { DeviceBox, ColorPicker } from './components'
import color from './helpers/colorPicker/color'

const os = window.require('os')
const {ipcRenderer} = window.require('electron')

const styles = theme =>({
  app:{
    position: 'relative',
    height: 'calc(100% - 40px)',
    margin: '20px 36px',
    boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.12)',
    overflow: 'auto',
    zIndex:1,
    '&:after':{
      content:'""',
      position:'absolute',
      top: 0,
      right: 0,
      left: 0,
      bottom: 0,
      backgroundColor:'rgba(255,255,255,.3)',
      backgroundImage: `url(${require('./images/bg.jpg')})`,
      backgroundPosition: 'center top',
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      filter: 'blur(5px)',
      zIndex:-1
    }
  },
  header:{
    padding:'12px 20px 12px 36px',
    backgroundColor: theme.palette.grey[800],
    color: theme.palette.grey[200],
    position: 'fixed',
    top: 40,
    left: 10,
    '&:before':{
      content: '""',
      width: 26,
      background: `${theme.palette.primary.main} fixed`,
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0
    }
  },
  headerTitle:{
    margin: 0
  },
  container:{
    padding: '100px 20px 20px'
  },
  themePanel:{
    position:'absolute',
    top:10,
    right:10
  },
  noDevice:{  
    padding:'100px 50px',
    textAlign: 'center'
  },
  networkNotify:{
    marginBottom:50,
    color: theme.palette.primary.main
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
  operateListTile:Object.assign({
    position: 'relative',
    padding: '30px 10px 10px',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    boxSizing: 'border-box',
    overflow:'auto'
  }, theme.palette.type==='light'?{
    background: theme.palette.grey[400]
  }:{
    border:`1px dotted ${theme.palette.grey[700]}`
  } ),
  tileTitle:{
    padding: '1px 3px',
    position: 'absolute',
    right: '0',
    top: '0',
    fontSize: theme.typography.body2.fontSize,
    color: '#FFF',
    background: theme.palette.grey[700],
    borderRadius: '0 0 0 3px'
  },
  colorPanel:{
    margin:'auto'
  },
  powerIcon:{
    fill: theme.palette.grey[600],
    width: '1em',
    height: '1em',
    display: 'inline-block',
    fontSize: 24,
    transition: 'fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    userSelect: 'none',
    flexShrink: 0
  },
  powerOn:{
    fill: red[600]
  },
  recommandColor:{
    margin:'15px auto 10px',
    width:240
  },
  colorbox:{
    margin: 3,
    display:'inline-block',
    width:24,
    height:24,
    borderRadius:'50%'
  },
  sceneImg:{
    width:'80px'
  }
})

const commonColors =[{hex:'#F44336',title:'red'}
  ,{hex:'#E91E63',title:'pink'}
  ,{hex:'#9C27B0',title:'purple'}
  ,{hex:'#673AB7',title:'deepPurple'}
  ,{hex:'#3F51B5',title:'indigo'}
  ,{hex:'#2196F3',title:'blue'}
  ,{hex:'#03A9F4',title:'lightBlue'}
  ,{hex:'#00BCD4',title:'cyan'}
  ,{hex:'#009688',title:'teal'}
  ,{hex:'#4CAF50',title:'green'}
  ,{hex:'#8BC34A',title:'lightGreen'}
  ,{hex:'#CDDC39',title:'lime'}
  ,{hex:'#FFEB3B',title:'yellow'}
  ,{hex:'#FFC107',title:'amber'}
  ,{hex:'#FF9800',title:'orange'}
  ,{hex:'#FF5722',title:'deepOrange'}
]

const recommand = {
  sunrise: {label:'sunset',image: '5.png'},
  sunset: {label:'sunset', image: '6.png'},
  nightmode: {label:'Night mode', image: '7.png', type:'color', params:[16750848,1]},
  datingnight: {label:'Dating night', image: '13.png', type:'color', params:[16737792,50]},
  movie: {label:'Movie', image: '28.png', type:'color', params:[1315890,50]},
  birthdayparty: {label:'Birthday party', image: '22.png', type:'cf', params:[0, 1, '1996,1,14438425,80,1996,1,14448670,80,1996,1,11153940,80']},
  romance: {label:'Romance', image: '11.png', type:'cf', params:[0, 1, '4000,1,5838189,1,4000,1,6689834,1']},
  home: {label:'Home', image: '27.png', command:{bright:80}},
  flashnotify: {label:'Flash notify', image: '9.png'},
  candleflicker: {label:'Candle flicker', image: '8.png', type:'cf', params:[0, 0, '800,2,2700,50,800,2,2700,30,1600,2,2700,80,800,2,2700,60,1200,2,2700,90,2400,2,2700,50,1200,2,2700,80,800,2,2700,60,400,2,2700,70']}
}

class App extends Component {
  commands={};
  constructor(props) {
    super(props)

    this.state = {      
      devices: [],
      anchorDid: null,
      anchorEl: null,     
      modalRenameOpen: false, 
      modalOperateOpen: false
    }
  }

  componentWillMount(){
    this.listener();
  }

  componentDidMount() {   
    this.loadConfig();   
  }

  handleScanDevices = ()=>this.scanDevices()

  handlePowerSwitch = (did, flag) => this.setPower(did,flag?'on':'off')

  
  handleColorChanged= (did,color)=>{
     this.setHSV(did,color.hsv.h,color.hsv.s*100);
  }

  handleBrightChange= (did,bright)=>{
    this.setBright(did,bright);
  }

  handleTemperature= (did,color)=>{
    this.setCtAbx(did, 6500 - color.hsv.s *(6500-1700));
  }

  handleScene = (did,name)=>{
    const scene = recommand[name];
    this.setScene(did, scene.type, ...scene.params);
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

  handleThemeChange = (theme)=>{
    this.props.onThemeChange(theme);    
    this.setTheme(theme);
  }
  

  getProp = (did,...props) => {
    //{"id":1,"method":"get_prop","params":["power", "not_exist", "bright"]}
    this.sendCommand(did, 'get_prop', props);
  }

  setName = (did,name) => {
    //{"id":1,"method":"set_name","params":["my_bulb"]}
    this.sendCommand(did,'set_name',[name]);
  }

  setDefault = (did) => {
    //{"id":1,"method":"set_default","params":[]}
    this.sendCommand(did, 'set_default', []);
  }

  setPower = (did, state) => {
    //{ "id": 1, "method": "set_power", "params":["on", "smooth", 500]}
    this.sendCommand(did, 'set_power', [state, 'smooth', 500]);
  }

  toggle = (did) => {
    //{"id":1,"method":"toggle","params":[]}
    this.sendCommand(did, 'toggle', []);
  }

  setBright = (did, bright) => {
    //{"id":1,"method":"set_bright","params":[50, "smooth", 500]}
    this.sendCommand(did, 'set_bright',[bright, 'smooth', 500]);
  }

  setCtAbx = (did, ct)=>{
    //{"id":1,"method":"set_ct_abx","params":[3500, "smooth", 500]}
    this.sendCommand(did, 'set_ct_abx',[ct, 'smooth', 500]);
  }

  //rgb: 0-16777215
  //rgb color format: 
  //RGB = (R*65536)+(G*256)+B
  setRGB = (did, rgb) => {
    //{"id":1,"method":"set_rgb","params":[255, "smooth", 500]}
    this.sendCommand(did, 'set_rgb',[rgb, 'smooth', 500]);
  }

  setHSV = (did, hue, saturation) => {
    //{"id":1,"method":"set_hsv","params":[255, 45, "smooth", 500]}
    this.sendCommand(did, 'set_hsv',[hue, saturation, 'smooth', 500]);
  }

  startCf = (did, count, action, expression) => {
    //{"id":1,"method":"start_cf","params":[ 4, 2, "1000, 2, 2700, 100, 500, 1,255, 10, 5000, 7, 0,0, 500, 2, 5000, 1"]
    //expression:[duration, mode, value, brightness]:
    this.sendCommand(did, 'start_cf', [count, action, expression]);
  }

  stopCf = (did) => {
    //{"id":1,"method":"stop_cf","params":[]}
    this.sendCommand(did, 'stop_cf', []);
  }

  setScene = (did, ...props) =>{
    // {"id":1,"method":"set_scene", "params": ["color", 65280, 70]}
    // {"id":1,"method":"set_scene", "params": ["hsv", 300, 70, 100]}
    // {"id":1, "method":"set_scene", "params":["ct", 5400, 100]}
    // {"id":1,
    // "method":"set_scene","params":["cf",0,0,"500,1,255,100,1000,1,16776960,70"]}
    // {"id":1, "method":"set_scene", "params":["auto_delay_off", 50, 5]
    this.sendCommand(did, 'set_scene', props);
  }

  //从本地加载设备
  loadConfig = ()=>{
    ipcRenderer.send('request',{
      type:'get_config'
    });
  }

  //设置主题
  setTheme = (theme)=>{
    ipcRenderer.send('request', {
      type: 'set_theme',
      theme
    })
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
      guid: _.keys(this.commands).length+1,
      method,
      params
    }
    this.commands[command.guid] = command;
    ipcRenderer.send('request',Object.assign({ type: 'command'},command) );
  }

  listener = () => {
     //监听主进程消息
     ipcRenderer.on('report', (event, arg) => {
      console.log(arg)
      switch (arg.type) {
        case 'get_config':
          const {theme, devices} = arg.config;
          const themeType =['light','dark'].includes(theme) ? theme : 'light';
          const userDevices = _.map(devices,device=>({did:device.did, address:device.address, connected:Boolean(device.connected), data:device.data||{}}));
          this.setState({           
            devices: userDevices
          }, () => {
            userDevices.forEach(device=>{
              this.connectDevice(device.did);
            })          
          });
          if(this.props.theme.palette.type !== themeType)
          {
            this.props.onThemeChange(themeType);
          }
          break;
        case 'notify': // 设备消息
          const {did, id, type, method, params, result, error} = arg.data;
          const device = this.state.devices.find(device => device.did === did);
          switch (type||method) {
            case 'connect':
              device.connected = true;
              this.getProp(did,'name','power','bright');
              break;
            case 'disconnect':
              device.connected = false;
              break;
            case 'props':
               device.data = Object.assign({},device.data, params);
              break;
            case 'error':
              console.error(error);
              break;
            default:
              const command = this.commands[id];
              if(command && command.method === 'get_prop')
              {
                const newParams = _.zipObject(command.params,result);
                device.data = Object.assign({},device.data, newParams);
              }
              break;
          }
          if(type !== 'error')
            this.setState({
              devices: this.state.devices
            })
          break;
        default:
          break;
      }
    })
  }

  render() {    
    const { classes, theme } = this.props
    const {devices, anchorEl, anchorDid, modalOperateOpen} = this.state;
    const anchorDevice = anchorDid && devices.find(device=>device.did === anchorDid);
    const osType = os.type();
    const osStr = osType === 'Linux' ? 'Linux' : 
          osType === 'Darwin' ? 'Mac' : 'Windows'
          
    return (
      <div className={classes.app}>
        <header className={classes.header}>
          <h1 className={classes.headerTitle}>Yeelight for {osStr}</h1>
        </header>
        <div className={classes.themePanel}>
          <FormControlLabel
            control={
              <Switch color="primary" checked={theme.palette.type === 'dark'} onChange={(e,checked)=>{this.handleThemeChange(checked?'dark':'light')}}></Switch>
            }
            label="Dark Theme"></FormControlLabel>
        </div>
        <div className={classes.container}>
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
            <Typography variant="headline" className={classes.networkNotify}>Make sure that the bulbs are in same network with your computer.</Typography>
            <Button variant="raised" color="primary" onClick={this.handleScanDevices} >
              Scan Devices
            </Button>
          </div>
        }  
          <Menu id="menu-id"
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
          {
            !anchorDevice?null:<Dialog fullScreen open={modalOperateOpen} onClose={this.handleModalClose}>
            <AppBar className={classes.appBar}>
              <Toolbar>
                <Typography variant="title" color="inherit" className={classes.flex}>{anchorDevice?((anchorDevice.data &&anchorDevice.data['name'])||anchorDevice.address||anchorDevice.did) :'Device Name'}</Typography>
                <IconButton color="inherit" onClick={this.handleModalClose} aria-label="Close">
                  <CloseIcon/>
                </IconButton>
              </Toolbar>
            </AppBar> 
            <div className={classes.operatePanel}>           
              <GridList cellHeight={96} cols={5} spacing={12}>
                <GridListTile cols={1}>
                  <div className={classes.operateListTile}>
                    <span className={classes.tileTitle}>power</span>
                    <Tooltip title={anchorDevice.data['power'] === 'on'?'Power Off':'Power On'} placement="top">
                      <IconButton aria-label="Power" onClick={()=>this.handlePowerSwitch(anchorDevice.did,anchorDevice.data['power']!=='on' )}>
                        <svg className={classnames(classes.powerIcon,anchorDevice.data['power'] === 'on'&&classes.powerOn)}  viewBox="0 0 15 15" focusable="false">
                          <g>
                            <path d="M10.5,1.674V4c1.215,0.912,2,2.364,2,4c0,2.762-2.238,5-5,5s-5-2.238-5-5c0-1.636,0.785-3.088,2-4
                              V1.674C2.135,2.797,0.5,5.208,0.5,8c0,3.866,3.134,7,7,7s7-3.134,7-7C14.5,5.208,12.865,2.797,10.5,1.674z"/>
                            <path d="M8.5,7.003V0.997C8.5,0.446,8.056,0,7.5,0c-0.553,0-1,0.453-1,0.997v6.006C6.5,7.554,6.944,8,7.5,8
                              C8.053,8,8.5,7.547,8.5,7.003z"/>
                          </g>
                        </svg>           
                      </IconButton>
                    </Tooltip>
                  </div>
                </GridListTile>
                <GridListTile cols={4}>
                  <div className={classes.operateListTile}>
                    <span className={classes.tileTitle}>brightness</span> 
                    <Slider defaultValue={anchorDevice.data['bright']||50} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>             
                  </div>
                </GridListTile>                
                <GridListTile rows={4} cols={1}>
                  <div className={classes.operateListTile}>
                    <span className={classes.tileTitle}>white</span>                    
                    <ColorPicker.White direction="vertical" width={10} height={296} className={classes.colorPanel} onChangeComplete={color=>this.handleTemperature(anchorDevice.did,color)}></ColorPicker.White>   
                  </div>
                </GridListTile>
                <GridListTile rows={4} cols={2}>
                  <div className={classes.operateListTile}>
                    <span className={classes.tileTitle}>color</span>
                    <ColorPicker.HSV className={classes.colorPanel} onChangeComplete={color=>this.handleColorChanged(anchorDevice.did,color)}>
                    </ColorPicker.HSV>
                    <div className={classes.recommandColor}>
                    {
                      commonColors.map((c,index)=>(
                        <Tooltip title={c.title} placement="top" key={index}>
                          <span key={index} className={classes.colorbox} style={{background:`${c.hex}`}}  onClick={e=>this.handleColorChanged(anchorDevice.did,color.toState(c.hex,0))}/>
                        </Tooltip>
                      ))
                    }
                    </div>
                  </div>
                </GridListTile>
                <GridListTile rows={4} cols={2}>
                  <div className={classes.operateListTile}>
                    <span className={classes.tileTitle}>recommend</span>  
                    <Grid container spacing={24}>
                    {              
                      _.map(recommand,(item,key) => (
                        <Grid item xs={12} sm={6} key={key} onClick={(e)=>this.handleScene(anchorDevice.did,key)}>
                          <img src={require(`./images/icon_yeelight_scene_type_${item.image}`)} className={classes.sceneImg} alt={item.label}/>
                          <Typography variant="subheading" color="primary">{item.label}</Typography>
                        </Grid>
                      ))
                    }
                  </Grid>                    
                  </div>
                </GridListTile>
                <GridListTile rows={15} cols={5}>
                  <div className={classes.operateListTile}>
                    <span className={classes.tileTitle}>flow</span> 
                    <Slider onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider defaultValue={50} disabled onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>                    
                    <Slider defaultValue={30} min={-50} max={50} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider defaultValue={30} min={-100} max={-50} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider defaultValue={30} min={100} max={1000} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider defaultValue={30} scaleLength={20} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider defaultValue={30} min={-100} scaleLength={30} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider defaultValue={50} color="green" onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider defaultValue={[30,80]} range  onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider defaultValue={[30,50]} range disabled  onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider defaultValue={[-30,30]} min={-50} max={50} range  scaleLength={20} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider defaultValue={[80,100]} min={50} max={200} range  scaleLength={30} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <br/>
                    <br/>
                    <div style={{height:200}}>
                    <Slider direction="vertical" onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider direction="vertical" defaultValue={50} disabled onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>                    
                    <Slider direction="vertical" defaultValue={30} min={-50} max={50} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider direction="vertical" defaultValue={30} min={-100} max={-50} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider direction="vertical" defaultValue={30} min={100} max={1000} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider direction="vertical" defaultValue={30} scaleLength={20} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider direction="vertical" defaultValue={30} min={-100} scaleLength={30} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider direction="vertical" defaultValue={50} color="green" onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider direction="vertical" defaultValue={[30,80]} range  onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider direction="vertical" defaultValue={[30,50]} range disabled  onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider direction="vertical" defaultValue={[-30,30]} min={-50} max={50} range  scaleLength={20} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider direction="vertical" defaultValue={[80,100]} min={50} max={200} range  scaleLength={30} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    <Slider direction="vertical" defaultValue={[80,100]} min={50} max={200} range  scaleLength={40} onChangeComplete={value=>this.handleBrightChange(anchorDevice.did,value)}></Slider>
                    </div>
                  </div>
                </GridListTile>
              </GridList>
            </div>
          </Dialog>  
          }
        </div>
      </div> 
    );
  }
}

export default  withStyles(styles,{withTheme:true})(App);
