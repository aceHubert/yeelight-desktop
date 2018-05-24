import React from 'react'
import { Component } from '../../libs'
import { withStyles } from '@material-ui/core/styles'

const styles = theme =>({
  pointer:{
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: 'transparent',
    border: `6px solid ${ theme.palette.grey[800] }`,
    boxShadow: theme.shadows[2],
    boxSizing:'border-box',
    cursor: 'pointer',
    zIndex:1
  },
  over:{
    '&:before':{
      content:'""',        
      display: 'block',
      border:`0 solid ${theme.palette.type==='light'?'rgba(0,0,0,.08)':'rgba(255,255,255,.1)'}`,
      position:'absolute',     
      overflow: 'hidden',    
      borderRadius: 'inherit',
      boxSizing:'border-box',
      pointerEvents: 'none',
      transition: 'border 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, width 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, height 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, left 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, top 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      zIndex:-1
    }
  },
  hover:{
    '&:before':{
      width:36,
      height:36,  
      borderWidth:10,
      left:-16,
      top:-16,
    }
  },
  pressed:{
    '&:before':{
      width:48,
      height:48,  
      borderWidth:16,
      left:-22,
      top:-22,
    }
  }
})

class Pointer extends Component{

  render(){
    const {classes, thumbColor, hover, focus, pressed} = this.props;
    let style = {};
    if(this.props.direction === 'vertical')
      style.transform =  'translate(-5px, -50%)';
    else if(this.props.direction === 'horizontal')
      style.transform = 'translate(-50%, -3px)';
    else
      style.transform = 'translate(-50%, -50%)';
    if(thumbColor){
      style.borderColor=thumbColor
    }

    return (
      <div className={this.className(classes.pointer,(hover||focus||pressed)&&classes.over,(hover||focus)&&classes.hover,pressed&&classes.pressed)} style={this.style(style)}>
      </div>
    )
  }
}

export default withStyles(styles)(Pointer)
