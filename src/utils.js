export const uuid = () => {
  return Date.now().toString(36) + (Math.round(Math.random() * 36)).toString(36);
}
export const clearCanvas = (ctx) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
export const fillBackground = (ctx, background) => {
  ctx.save();
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

export const getRandomColor = () => {
  const r = Math.round(Math.random() * 255)
  const g = Math.round(Math.random() * 255)
  const b = Math.round(Math.random() * 255)
  return `rgb(${r},${g},${b})`
}
