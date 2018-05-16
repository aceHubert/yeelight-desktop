import React from 'react'
import { Component } from '../../libs'
import PropTypes from 'prop-types'
import _ from 'lodash'
import debounce from 'lodash/debounce'
import { withStyles } from 'material-ui/styles'
import { calculateChange } from "../../helpers/slider";


const styles = theme =>({
  warp:{
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0
  },
  trackContainer:{
    width:'100%',
    height:'100%'
  },
  track:{
    position: 'absolute',
    transition: 'margin 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms'
  },
  pointer:{
    margin: '1px 0px 0px',
    width: 12,
    height: 12,    
    backgroundClip: 'padding-box',
    border: '0px solid transparent',
    borderRadius: '50%',
    boxSizing: 'border-box',
    position: 'absolute',
    cursor: 'pointer',
    pointerEvents: 'inherit',   
    transform: 'translate(-50%, -50%)',
    transition: 'background 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, border-color 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, width 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, height 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    overflow: 'visible',
    outline: 'none',
    zIndex: 1  
  },
  pointerRight:{
    transform: 'translate(50%, -50%)',
  },
  pointerOver:{
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
  pointerHover:{
    '&:before':{
      width:36,
      height:36,  
      borderWidth:12,
      left:-12,
      top:-12,
    }
  },
  pointerPressed:{
    '&:before':{
      width:48,
      height:48,  
      borderWidth:18,
      left:-18,
      top:-18,
    }
  },
  pointerDisabled:{
    
  }
})

class Slider extends Component{

  static defaultProps={
    min:0,
    max:100,
    defaultValue:0,
    range:false,
    scale:0,
    direction:'horizontal',
    onChange:()=>{},
    onChangeComplete:()=>{}
  }

  activePointer: null;
  constructor(props){
    super(props)
   
    const {range, defaultValue, min, max} = props;
    let value =[min,max];
    if(range)
    {
      if(_.isArray(defaultValue)){
        const valueMin = defaultValue[0]||min;
        const valueMax = defaultValue[1]||max;
        value[0] = Math.min(valueMin,valueMax);
        value[1] = Math.max(valueMin,valueMax);
      }else if(_.isNumber(defaultValue))
      {
        value[0] = defaultValue;
      }
    }else{
      value = _.isNumber(defaultValue) && defaultValue >= min && defaultValue <= max ? defaultValue : min;
    }
    this.state={
      value,
      hover: false,
      pressed: false     
    }

    this.debounce = debounce((fn, data, event) => {
      fn(data, event)
    }, 100)
  }

  componentWillUnmount() {
    this.unbindEventListeners()
  }

  triggerChange= (event)=>{
    this.props.onChangeComplete && this.debounce(this.props.onChangeComplete, this.state.value, event)
    this.props.onChange && this.props.onChange(this.state.value, event)
  }
  
  handleChange = (e, skip)=>{
    const {range, min, max, disabled} = this.props;
    if(disabled) return;

    const change = calculateChange(e,skip,this.props,this.container);   
    const oldValue = this.state.value;
    const newValue = Math.round(change/100*((max-min)));  
    if(range){
      if((this.activePointer==='left' && oldValue[0] != newValue && newValue < oldValue[1]) || newValue <= oldValue[0] ){
        this.activePointer==='right'&&(this.activePointer='left');
        this.setState({
          value:[newValue,oldValue[1]]
        },()=>{this.triggerChange(e)})
      }else if((this.activePointer==='right' && oldValue[1] != newValue && newValue > oldValue[0])|| newValue >= oldValue[1]) {
        this.activePointer==='left'&&(this.activePointer='right');
        this.setState({
          value:[oldValue[0],newValue]
        },()=>{this.triggerChange(e)})
      }
    }else{         
      if(oldValue != newValue)
      {
        this.setState({
          value:newValue
        },()=>{this.triggerChange(e)})
      }     
    }
   
  }

  handleTouchStart = (e, skip)=>{
    this.setState({
      pressed: true
    })
    this.handleChange(e,skip);
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

  handleMouseUp = () => {
    this.setState({
      pressed: false
    })
    this.unbindEventListeners()
  }

  unbindEventListeners() {
    window.removeEventListener('mousemove', this.handleChange)
    window.removeEventListener('mouseup', this.handleMouseUp)
  }

  render(){
    const {classes, theme, min, max, defaultValue, range, scale, direction, disabled} = this.props;
    const {value, hover, pressed}=this.state;
    let rootStyle={
      position: 'relative',
      width:'100%',
      height: 48
    }
    let containerStyle={ 
      position:'absolute',     
      top: 23,
      left: 0,
      width: '100%',
      height: 2
    }
    if(direction==='vertical'){
      Object.assign(rootStyle,{
        width:48,
        height:'100%'
      });
      Object.assign(containerStyle,{
        top:0,
        left:23,
        height:'100%',
        width:2
      })
    }

    let trackEl;
    let thumbEl
    if(range){
      const offsetLeft = Math.round(value[0]/(max-min)*100);
      const offsetRight = 100 - Math.round(value[1]/(max-min)*100);

      const trackActiveStyle={
        height: '100%',      
        left: `${offsetLeft}%`,
        right: `${offsetRight}%`,
        backgroundColor: disabled ?  theme.palette.grey[500] : theme.palette.primary[theme.palette.type],
        marginRight: 6,
        marginLeft:6       
      }
      const trackLeftStyle={
        height: '100%',
        left: 0,
        backgroundColor:  theme.palette.grey[500],
        marginRight: 6,
        width: `calc(${offsetLeft}%)`  
      }
      const trackRightStyle={
        height: '100%',
        right: 0,
        backgroundColor:  theme.palette.grey[500],
        marginLeft: 6,
        width: `calc(${offsetRight}%)`  
      }
      const thumbLeftStyle={        
        backgroundColor: disabled ?  theme.palette.grey[500] :  theme.palette.primary.main,
        top:0,
        left:`${offsetLeft}%`
      }
      const thumbLeftClass=this.classNames(classes.pointer,
        disabled && classes.pointerDisabled,
        this.activePointer==='left' && !disabled && (hover||pressed) && classes.pointerOver,
        this.activePointer==='left' && !disabled && hover && classes.pointerHover,
        this.activePointer==='left' && !disabled && pressed && classes.pointerPressed);
      const thumbRightStyle={        
        backgroundColor: disabled ?  theme.palette.grey[500] :  theme.palette.primary.main,
        top:0,
        right:`${offsetRight}%`
      }
      const thumbRightClass=this.classNames(classes.pointer,classes.pointerRight,
        disabled && classes.pointerDisabled,
        this.activePointer==='right' && !disabled && (hover||pressed) && classes.pointerOver,
        this.activePointer==='right' && !disabled && hover && classes.pointerHover,
        this.activePointer==='right' && !disabled && pressed && classes.pointerPressed);
      trackEl=(<div>
        <div className={classes.track} style={trackLeftStyle}></div>
        <div className={classes.track} style={trackActiveStyle}></div>
        <div className={classes.track} style={trackRightStyle}></div>
      </div>)
      thumbEl= (<div>
        <div className={thumbLeftClass} 
          style={thumbLeftStyle}
          onMouseOver={()=>{this.activePointer='left'}}
          onTouchStart={()=>{this.activePointer='left'}}></div>
        <div className={thumbRightClass} 
          style={thumbRightStyle} 
          onMouseOver={()=>{this.activePointer='right'}}
          onTouchStart={()=>{this.activePointer='right'}}></div>
      </div>)
    }else{
      const offset = Math.round(value/(max-min)*100);

      const trackActiveStyle={
        height: '100%',
        left: 0,
        backgroundColor: disabled ?  theme.palette.grey[500] : theme.palette.primary[theme.palette.type],
        marginRight: 6,
        width: `calc(${offset}%)`        
      }
      const trackStyle={
        height: '100%',
        right: 0,
        backgroundColor:  theme.palette.grey[500],
        marginLeft: 6,
        width: `calc(${100-offset}%)`  
      }
      const thumbStyle={        
        backgroundColor: disabled ?  theme.palette.grey[500] : theme.palette.primary.main,
        top:0,
        left:`${offset}%`
      }
      const thumbClass=this.classNames(classes.pointer,
        disabled && classes.pointerDisabled,
        !disabled && (hover||pressed)&&classes.pointerOver,
        !disabled && hover&&classes.pointerHover,pressed&&classes.pointerPressed);
      trackEl=(<div>
        <div className={classes.track} style={trackActiveStyle}
        onMouseOver={this.handleMouseOver}></div>
        <div className={classes.track} style={trackStyle}></div>
      </div>)
      thumbEl = (<div className={thumbClass} style={thumbStyle}></div>)
    }  

    return (
      <div className={this.className('slider')} style={this.style(rootStyle)}>
        <div className={classes.warp}
          ref={ container => this.container = container } 
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          onMouseDown={this.handleMouseDown}  
          onTouchMove={this.handleChange }  
          onTouchStart={this.handleTouchStart }
          onTouchEnd={this.handleMouseOut}>
          <div style={containerStyle}>
            {trackEl}
            {thumbEl}
          </div>
        </div>
      </div>
    )
  }
}

Slider.propTypes={
  min: PropTypes.number,
  max: PropTypes.number,
  defaultValue: PropTypes.oneOfType([PropTypes.number,PropTypes.arrayOf(PropTypes.number)]),
  range: PropTypes.bool,
  scale: PropTypes.number,
  direction : PropTypes.oneOf(['horizontal','vertical']),
  disabled: PropTypes.bool,
  onChange: PropTypes.func,
  onChangeComplete: PropTypes.func
}

export default withStyles(styles,{withTheme:true})(Slider)
