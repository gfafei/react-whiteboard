export const uuid = () => {
  return Date.now().toString(36) + (Math.round(Math.random() * 36)).toString(36);
}
export const clearCanvas = (ctx, scale) => {
  ctx.clearRect(0, 0, ctx.canvas.width / scale, ctx.canvas.height / scale);
}
export const fillBackground = (ctx, scale, background) => {
  ctx.save();
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, ctx.canvas.width / scale, ctx.canvas.height / scale);
  // ctx.restore();
}

export const getRandomColor = () => {
  const r = Math.round(Math.random() * 255)
  const g = Math.round(Math.random() * 255)
  const b = Math.round(Math.random() * 255)
  return `rgb(${r},${g},${b})`
}
