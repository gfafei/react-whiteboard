import Tool from './tool';

const getDistance = (e) => {
  const touches = e.touches;
  const x0 = touches[0].clientX;
  const x1 = touches[1].clientX;
  const y0 = touches[0].clientY;
  const y1 = touches[1].clientY;
  const dx = x0 - x1;
  const dy = y0 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
class Zoom extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Zoom';
    this.icon = 'icon-hand';
    this.label = 'hand';
    this.origin = {
      scrollX: document.documentElement.scrollLeft,
      scrollY: document.documentElement.scrollTop,
      x: 0,
      y: 0,
      scale: 1,
      zoom: 1
    }

    document.addEventListener('touchmove', (e) => {
      const touches = e.touches;
      if (touches.length !== 2) return;
      if (!state.mousePressed) return;
      const distance = getDistance(e);
      const delta = distance - this.origin.distance;
      const scale = this.origin.scale * ( 1+ delta * 0.5 / 100);
      if (scale > 1) {
        this.origin.zoom = scale;
        state.context.canvas.style.transform = `scale(${scale})`
      }
    })
    //禁止IOS端双指放大
    document.addEventListener('gesturestart', function(event) {
      event.preventDefault();
    });
  }

  handleMouseDown(e) {
    const touches = e.touches;
    if (touches.length !== 2) return;
    this.origin.scrollX = document.documentElement.scrollLeft;
    this.origin.scrollY = document.documentElement.scrollTop;
    this.origin.distance = getDistance(e);
    this.origin.scale = this.origin.zoom;
  }

}

export default Zoom;
