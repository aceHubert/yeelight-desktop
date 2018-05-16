import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classname from 'classname'
import Card, {CardHeader, CardMedia} from 'material-ui/Card'
import IconButton from 'material-ui/IconButton'
import Tooltip from 'material-ui/Tooltip'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import {withStyles} from 'material-ui/styles'
import red from 'material-ui/colors/red'

const styles = theme =>({
  card: {
    display: 'flex',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 0 auto',
  },
  cover: {
    width: 132,
    height: 132,
  },
  title:{
    fontSize:'1.125rem',
    maxWidth: 172,
    overflow: 'hidden',
    whiteSpace: 'nowarp',
    textOverflow: 'ellipsis',
    display: 'inline-block'
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
  deviceIcon:{
    padding: theme.spacing.unit,
    background:theme.palette.primary.main
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
  }
})

class DeviceBox extends Component {

  static defaultProps={
    power:false,
    connected:false,
    onSwitch:()=>{},
    onActionMore:()=>{}
  }

  handleSwitch=()=>{
     this.props.onSwitch(!this.props.power);
  }

  handleActionMore=(e)=>{
    this.props.onActionMore(e.currentTarget)
  }

  render() {
    const {classes, did, name, mode, ipAddress, power, connected, onActionMore} = this.props;

    return (
      <div >
        <Card className={classes.card}>
          <div className={classes.deviceIcon}>
            <CardMedia
              className={classes.cover}
              image={require('../../images/icon_yeelight_device_badge_group_small.png')}
              title={mode}/>
          </div>  
          <div className={classes.details}>
            <CardHeader
              action={
                Boolean(onActionMore)? <IconButton onClick={this.handleActionMore}>
                  <MoreVertIcon />
                </IconButton> : null
              }
              title={<span className={classes.title}>{name||did}</span>}
              subheader={ipAddress}
            />
            <div className={classes.controls}>
            {
              connected ? <Tooltip title={power?'Power Off':'Power On'} placement="right">
                <IconButton aria-label="Power" onClick={this.handleSwitch}>
                  <svg className={classname(classes.powerIcon,power&&classes.powerOn)}  viewBox="0 0 15 15" focusable="false">
                    <g>
                      <path d="M10.5,1.674V4c1.215,0.912,2,2.364,2,4c0,2.762-2.238,5-5,5s-5-2.238-5-5c0-1.636,0.785-3.088,2-4
                        V1.674C2.135,2.797,0.5,5.208,0.5,8c0,3.866,3.134,7,7,7s7-3.134,7-7C14.5,5.208,12.865,2.797,10.5,1.674z"/>
                      <path d="M8.5,7.003V0.997C8.5,0.446,8.056,0,7.5,0c-0.553,0-1,0.453-1,0.997v6.006C6.5,7.554,6.944,8,7.5,8
                        C8.053,8,8.5,7.547,8.5,7.003z"/>
                    </g>
                  </svg>           
                </IconButton>
              </Tooltip> : null
            }
            </div>
          </div>
        </Card>    
      </div>
    )
  }
}

DeviceBox.propTypes = {
  did: PropTypes.string.isRequired,
  name: PropTypes.string,
  mode: PropTypes.string,
  ipAddress: PropTypes.string.isRequired,
  power: PropTypes.bool.isRequired,
  connected: PropTypes.bool.isRequired,
  onSwitch: PropTypes.func,
  onActionMore: PropTypes.func
}

export default withStyles(styles, { withTheme: true })(DeviceBox)