import React from 'react'
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import { Component } from '../../libs'
import Pointer from "./Pointer"
import ColorWarp from './ColorWarp'
import { calculateChange } from "../../helpers/colorPicker/white"

const styles = theme=>({  
  warp:{
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0
  },
  bgColor:{
    padding: '0px 2px',
    position: 'relative', 
    height: '100%', 
    borderRadius: '2px'
  },
  warmColor: {
    height: '100%',
    borderRadius: '2px'
  },
  horizontal: {
    // background: '-webkit-linear-gradient(to right, #fff, rgba(255,255,255,0))',
    background: 'linear-gradient(to right, #fff, rgba(255,255,255,0))'
  },
  vertical: {
    // background: '-webkit-linear-gradient(to top, #fff, rgba(255,255,255,0))',
    background: 'linear-gradient(to bottom, #fff, rgba(255,255,255,0))'
  }
})

class WarmLight extends Component {

  static defaultProps={
    width: 316,
    height: 10,
    direction: 'horizontal'
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

  handleMouseDown = (e)=>{
    this.setState({
      pressed: true
    })
    this.handleChange(e, true)
    window.addEventListener('mousemove', this.handleChange)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  handleTouchStart = (e, skip)=>{
    this.setState({
      pressed: true
    })
    this.handleChange(e,skip);
    window.addEventListener('touchend', this.handleMouseUp)
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

  render() {
    const {classes, pointer, ...otherPorps} = this.props;
    const {maxNum,minNum} = {maxNum:Math.max(this.props.width,this.props.height),minNum:Math.min(this.props.width,this.props.height)};
    const isHorizontal = this.props.direction === 'horizontal'
    const {width,height} = isHorizontal ?{width:maxNum,height:minNum}:{width:minNum,height:maxNum};
    const rootStyle = {
      position: 'relative',
      width: width,
      height: height,
    }

    const bgColorStyle ={
        background:`hsl(${this.props.hsl.h},100%,50%)`
    }

    let pointerOffset ={
      position: 'absolute'
    }

    const offset =  this.props.hsv.s*100
    if(!isHorizontal)
    {
      pointerOffset.top=`${ offset > 100 ? 100 : offset }%`;
    }else{
      pointerOffset.left=`${ offset > 100 ? 100 : offset }%`;
    }

    return <div className={this.className('warmlight-picker')}  style={this.style(rootStyle)}>
      <div className={classes.warp}  
        ref={ container => this.container = container } 
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
        onMouseDown={this.handleMouseDown}  
        onTouchMove={ this.handleChange }  
        onTouchStart={ this.handleTouchStart }>
        <div className={classes.warmColor} style={bgColorStyle}>  
          <div className={this.classNames(classes.bgColor, isHorizontal ? classes.horizontal : classes.vertical)}>
            <div style={pointerOffset} className={classes.pointer}>
            {pointer ? (<pointer {...otherPorps} {...this.state}/>) : <Pointer {...otherPorps} {...this.state}/>}
            </div>
          </div> 
        </div>       
      </div>
    </div>;
  }
}

WarmLight.propTypes={
  width: PropTypes.number,
  height: PropTypes.number,
  direction : PropTypes.oneOf(['horizontal','vertical']),
  pointer: PropTypes.node
}
export default withStyles(styles)(ColorWarp(WarmLight,{h:30,s:1,l:0.95,a:1}));