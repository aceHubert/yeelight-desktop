import React, {Component} from 'react'

class Pointer extends Component{

  render(){
    const style = {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      transform: 'translate(-9px, -1px)',
      backgroundColor: 'transparent',
      border: '5px solid rgb(248,248,248)',
      boxShadow: 'rgba(0, 0, 0, 0.37) 0px 1px 4px 0px'
    }

    return (
      <div style={style}>
      </div>
    )
  }
}


export default Pointer
