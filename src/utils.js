export const uuid = () => {
  return Date.now().toString(36) + (Math.round(Math.random() * 36)).toString(36);
}
export const clearCanvas = (ctx, scale) => {
  ctx.clearRect(0, 0, ctx.canvas.width / scale, ctx.canvas.height / scale);
}
export const fillBackground = (ctx, scale, background) => {
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, ctx.canvas.width / scale, ctx.canvas.height / scale);
}

export const getRandomColor = () => {
  const r = Math.round(Math.random() * 255)
  const g = Math.round(Math.random() * 255)
  const b = Math.round(Math.random() * 255)
  return `rgb(${r},${g},${b})`
}

export const isMobile = () => {
  const mobileRE = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i
  const ua = navigator.userAgent;
  if (typeof ua !== 'string') return false

  let result = mobileRE.test(ua)

  if (
    !result &&
    navigator &&
    navigator.maxTouchPoints > 1 &&
    ua.indexOf('Macintosh') !== -1 &&
    ua.indexOf('Safari') !== -1
  ) {
    result = true
  }

  return result
}
