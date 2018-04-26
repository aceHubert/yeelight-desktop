import React, { Component } from 'react';
const { ipcRenderer } = window.require('electron');

class App extends Component {

  constructor(props){
    super(props)

    this.state={
      drives:[]
    }
  }

  componentDidMount(){
    
    ipcRenderer.on('report', (event, arg) => {
      console.log(arg)
      switch (arg.type)
      {
        case 'add-drive':
          this.setState({
            drives: this.state.drives.concat(arg.config)
          });
          break;
      }
    })
  }

  handleConnectDrive=(driveId)=>{
    ipcRenderer.send('command',{
      type:'connect',
      id: driveId
    })
  }


  render() {
    const { drives } = this.state;
    return (
      <div className="app">
        <header className="app-header">
          <img src={require('./images/ic_locale_plugin.png')} className="app-header__logo" alt="logo" />
          <h1 className="app-header__title">Yeelight for desktop</h1>
        </header>
        <div className="app-container">
          <ul className="app-drives">
          {
            drives.map((drive,inx)=>{
              return <li key={inx} className="app-drive" onClick={this.handleConnectDrive.bind(this,drive.id)}>
              <img src={require('./images/icon_yeelight_scene_type_1.png')} alt="icon" className="app-drive__icon" />
              <p className="app-drive__name">{drive.props.name || drive.address}</p>
              </li>
            }) 
             
          }
          {
            drives.length < 8?
            Array.from({length: 8- drives.length}).map((item,index)=>{
              return <li key={index} className="app-drive"></li>
            }):null         
          }
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
