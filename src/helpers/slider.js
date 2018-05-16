export const calculateChange = (e, skip, props, container) => {
  e.preventDefault()
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  const x = typeof e.pageX === 'number'
    ? e.pageX
    : e.touches[0].pageX
  const y = typeof e.pageY === 'number'
    ? e.pageY
    : e.touches[0].pageY
  const left = x - (container.getBoundingClientRect().left + window.pageXOffset)
  const top = y - (container.getBoundingClientRect().top + window.pageYOffset)

  if (props.direction === 'vertical') {
  }else{
    let offset;
    if (left < 0) {
      offset =0
    } else if (left > containerWidth) {
      offset = 100
    } else {
      offset = Math.round((left * 100) / containerWidth)
    }
    return offset;
  }
  return null
}