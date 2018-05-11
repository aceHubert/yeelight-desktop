export const calculateChange = (e, skip, props, container) => {
  e.preventDefault()
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight
  const x = typeof e.pageX === 'number' ? e.pageX : e.touches[0].pageX
  const y = typeof e.pageY === 'number' ? e.pageY : e.touches[0].pageY
  const left = x - (container.getBoundingClientRect().left + window.pageXOffset)
  const top = y - (container.getBoundingClientRect().top + window.pageYOffset)

  if (props.direction === 'vertical') {
    let l
    if (top < 0) {
      l = 100
    } else if (top > containerHeight) {
      l = 50
    } else {
      const percent = l = -((top * 100) / containerHeight) + 100
      l = 50 + (100-percent)/2
    }

    if (props.hsl.l !== l) {
      return {
        h: 29,
        s: 1,
        l,
        a: props.hsl.a,
        source: 'rgb',
      }
    }
  } else {
    let l
    if (left < 0) {
      l = 100
    } else if (left > containerWidth) {
      l = 50
    } else {
      const percent = (left * 100) / containerWidth
      l = 50 + (100-percent)/2
    }

    if (props.hsl.l !== l) {
      return {
        h: 29,
        s: 1,
        l,
        a: props.hsl.a,
        source: 'rgb',
      }
    }
  }
  return null

}