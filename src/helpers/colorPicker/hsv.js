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

  const radius = props.width / 2;
  let opposite; //对边长度
  let adjacent; //邻边长度
  if (top < 0 || top > containerHeight) 
    opposite = radius
  else if (top < radius) 
    opposite = radius - top
  else 
    opposite = top - radius
  if (left < 0 || left > containerWidth) 
    adjacent = radius
  else if (left < radius) 
    adjacent = radius - left
  else 
    adjacent = left - radius

  const radian = Math.atan(opposite / adjacent);
  let angle = radian / (2 * Math.PI / 360);  
  if(left <= radius && top > radius)
    angle = 180 - angle;
  if (left <= radius && top <= radius) 
    angle += 180;
  else if (left > radius && top <= radius)
    angle = 360 - angle;

  const h = angle;
  const s = Math.sqrt(opposite * opposite + adjacent * adjacent)/radius;
  if (props.hsv.h !== h || props.hsv.s !== s) {
    return {
      h: h, 
      s: s > 1 ? 1 : s, 
      v: props.hsv.v, 
      a: 1, 
      source: 'rgb'}
  }
  return null

}