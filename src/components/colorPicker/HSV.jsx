import React from 'react';
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import { Component } from '../../libs'
import Pointer from "./Pointer"
import ColorWarp from './ColorWarp'
import { calculateChange } from "../../helpers/colorPicker/hsv"

const array = Array.from(new Array(360),(val,index)=>index)
const styles = theme=>({
  warp:{
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    borderRadius: '50%'
  },
  span:{
    cursor: 'pointer',
    position: 'absolute',   
    transformOrigin: '0px 50%'
  }
})

class Wheel extends Component{

  static defaultProps={
    width: 220
  }

  constructor(props){
    super(props)

    this.state={
      hover:false,
      pressed:false
    }
  }

  componentWillUnmount() {
    this.unbindEventListeners()
  }

  handleChange = (e, skip)=>{ 
    const change = calculateChange(e,skip,this.props,this.container);
    change && this.props.onChange && this.props.onChange(change,e);
  }



  handleMouseOver=(e)=>{
    this.setState({
      hover: true
    })
  }

  handleMouseOut=(e)=>{
    this.setState({
      hover: false
    })
  }

  handleTouchStart = (e, skip)=>{
    this.setState({
      pressed: true
    })
    this.handleChange(e,skip);
    window.addEventListener('touchend', this.handleMouseUp)
  }

  handleMouseDown = (e)=>{
    this.setState({
      pressed: true
    })
    this.handleChange(e, true)
    window.addEventListener('mousemove', this.handleChange)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  handleMouseUp = () => {
    this.setState({
      pressed: false
    })
    this.unbindEventListeners()
  }

  unbindEventListeners() {
    window.removeEventListener('mousemove', this.handleChange)
    window.removeEventListener('mouseup', this.handleMouseUp)
    window.removeEventListener('touchend', this.handleMouseUp)
  }

  render(){
    const {classes, width, hsv} = this.props;
    const radius = width/2

    const rootStyle = {
      position: 'relative',
      width: width,
      height: width
    }

    const spanStyle ={
      top: radius, 
      left: radius, 
      width: width - radius,
      height: 3,
    }

    let angle = hsv.h % 90; //角度
    if((hsv.h > 90 && hsv.h < 180) || (hsv.h > 270 && hsv.h < 360))
      angle = 90 - angle;
    const radian = 2*Math.PI/360*angle; //弧度
    const hypotenuse = radius * hsv.s; //斜边长度
    const opposite = Math.sin(radian)*hypotenuse; //对边长度
    const adjacent = Math.cos(radian)*hypotenuse; //邻边长度
    let x = angle === 0 ? hypotenuse : adjacent ; 
    let y = angle === 0 ? radius : opposite; 
    if(hsv.h>90 && hsv.h <270)
    {
      x = radius - x;      
    }
    else if(hsv.h < 90 || hsv.h > 270){
      x = radius + x;
    }
    if(hsv.h>180 && hsv.h <360)
    {
      y= radius -y;      
    }
    else if(hsv.h > 0 && hsv.h < 180){
      y=  radius +y;   
    }
    let pointerOffset ={
      position: 'absolute',
      left: x,
      top: y
    }

   return (<div className={this.className('wheel-picker')} style={this.style(rootStyle)}>
    <div className={classes.warp}  
      ref={ container => this.container = container } 
      onMouseOver={this.handleMouseOver}
      onMouseOut={this.handleMouseOut}
      onMouseDown={this.handleMouseDown}  
      onTouchMove={ this.handleChange }  
      onTouchStart={ this.handleTouchStart }
      onTouchEnd={this.handleMouseOut}>
        {
          array.map(num=>{
            const style = {
              background:`linear-gradient(to right, #fff, hsl(${num}, 100%, 50%))`,
              transform:`rotate(${num}deg)`
            }
            return <span key={num} className={classes.span} style={Object.assign({},spanStyle,style)}></span>
          })
        }
        <div style={pointerOffset}>
          <Pointer {...this.props} {...this.state}/>
        </div>
      </div>
    </div>)
  }
}

Wheel.propTypes={
  width: PropTypes.number
}

export default withStyles(styles)(ColorWarp(Wheel));