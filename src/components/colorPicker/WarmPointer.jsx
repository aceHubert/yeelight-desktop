import React from 'react'
import { Component } from '../../libs'
import {withStyles} from 'material-ui/styles'

const styles = theme =>({
  pointer:{
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: `5px solid ${ theme.palette.grey[800] }`,
    boxShadow: 'rgba(0, 0, 0, 0.5) 0px 1px 4px 0px'
  }
})

class Pointer extends Component{

  static defaultProps={
    direction:'horizontal'
  }

  render(){
    const {classes} = this.props;
    let style ;
    if(this.props.direction === 'vertical')
      style = {
        transform: 'translate(-3px, -9px)',
      }
    else
      style =  {
        transform: 'translate(-9px, -1px)'
      }

    return (
      <div className={this.className(classes.pointer)} style={this.style(style)}>
      </div>
    )
  }
}

export default withStyles(styles)(Pointer)
