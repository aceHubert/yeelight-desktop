import React from 'react';
import PropTypes from 'prop-types'
import classname from 'classname'
import debounce from 'lodash/debounce'
import {withStyles} from 'material-ui/styles';
import { CustomPicker } from 'react-color';
import Pointer from "./Pointer";
import { calculateChange } from "./calculateChange";

const styles = theme=>({  
  warp:{
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    borderRadius: '2px'
  },
  bgColor:{
    padding: '0px 2px',
    position: 'relative', 
    height: '100%', 
    borderRadius: '2px'
  },
  warmColor: {
    height: '100%',
    background: 'rgb(255,150,50)'
  },
  horizontal: {
    background: '-webkit-linear-gradient(to right, #fff, rgba(255,255,255,0))',
    background: 'linear-gradient(to right, #fff, rgba(255,255,255,0))'
  },
  vertical: {
    background: '-webkit-linear-gradient(to top, #fff, rgba(255,255,255,0))',
    background: 'linear-gradient(to top, #fff, rgba(255,255,255,0))'
  }

})

class WarmLightPicker extends React.Component {

  static defaultProps={
    width: 316,
    height: 16,
    direction: 'horizontal'
  }

  constructor(props){
    super(props)
  }

  componentWillUnmount() {
    this.unbindEventListeners()
  }

  handleChange = (e, skip)=>{
    const change = calculateChange(e,skip,this.props,this.container);
    console.log(change)
    change && this.props.onChange && this.props.onChange(change,e);
  }

  handleMouseDown = (e)=>{
    this.handleChange(e, true)
    window.addEventListener('mousemove', this.handleChange)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  handleMouseUp = () => {
    this.unbindEventListeners()
  }

  unbindEventListeners() {
    window.removeEventListener('mousemove', this.handleChange)
    window.removeEventListener('mouseup', this.handleMouseUp)
  }

  render() {
    const {classes, direction, pointer} = this.props;
    const {maxNum,minNum} = {maxNum:Math.max(this.props.width,this.props.height),minNum:Math.min(this.props.width,this.props.height)};
    const {width,height} = direction === 'horizontal' ?{width:maxNum,height:minNum}:{width:minNum,height:maxNum};
    const rootStyle = {
      position: 'relative',
      width: width,
      height: height,
    }

    const pointerStyle ={
      position: 'absolute',
      left: `${ (100 - (this.props.hsl.l * 100))*2 }%`,
    }

    return <div className="warmlight-picker"  style={rootStyle}>
      <div className={classes.warp}  
        ref={ container => this.container = container } 
        onMouseDown={this.handleMouseDown}  
        onTouchMove={ this.handleChange }  
        onTouchStart={ this.handleChange }>
        <div className={classes.warmColor}>  
          <div className={classname(classes.bgColor, direction === 'horizontal'? classes.horizontal : classes.vertical)}>
            <div style={pointerStyle}>
            {pointer ? (<pointer {...this.props}/>) : <Pointer/>}
            </div>
          </div> 
        </div>       
      </div>
    </div>;
  }
}

WarmLightPicker.propTypes={
  width: PropTypes.number,
  height: PropTypes.number,
  direction : PropTypes.oneOf(['horizontal','vertical']),
  pointer: PropTypes.node
}

export default withStyles(styles)(CustomPicker(WarmLightPicker));