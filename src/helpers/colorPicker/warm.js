export const calculateChange = (e, skip, props, container) => {
  e.preventDefault()
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  const x = typeof e.pageX === 'number' ? e.pageX : e.touches[0].pageX
  const y = typeof e.pageY === 'number' ? e.pageY : e.touches[0].pageY
  const left = x - (container.getBoundingClientRect().left + window.pageXOffset)
  const top = y - (container.getBoundingClientRect().top + window.pageYOffset)

  if (props.direction === 'vertical') {
    let s
    if (top < 0) {
      s = 0
    } else if (top > containerHeight) {
      s = 100
    } else {
      const percent = (top * 100) / containerHeight
      s = percent
    }
    if (props.hsv.s !== s) {
      return {
        h: props.hsv.h,
        s: s/100,
        v: props.hsv.v,
        a: 1,
        source: 'rgb',
      }
    }
  } else {
    let s
    if (left < 0) {
      s =0
    } else if (left > containerWidth) {
      s = 100
    } else {
      const percent = (left * 100) / containerWidth
      s =percent
    }

    if (props.hsv.s !== s) {
      return {
        h: props.hsv.h,
        s: s/100,
        v: props.hsv.v,
        a: 1,
        source: 'rgb',
      }
    }
  }
  return null

}