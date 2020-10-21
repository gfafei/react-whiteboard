import Tool from './tool'

const getColorFromPixel = (pixel) => {
  return `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
}
class Eraser extends Tool {
  constructor(state) {
    super(state);
    this.state = state;
    this.name = 'Eraser';
    state.colorHash = new Map();
    this.cursor = 'url("eraser.svg") 5 20, auto';
    this.icon = 'icon-eraser';
    this.label = 'Eraser';
  }

  draw(data) {
    if (data.type !== 'delete') {
      console.error('unknown type ' + data.type);
      return;
    }
    const id = data.id;
    const state = this.state;
    const element = this.state.elements.get(id)
    state.colorHash.delete((element.colorKey));
    state.elements.delete(id);
    this.refresh();
  }

  getElementByPoint(point) {
    const state = this.state;
    const pixel = state.hitRegionContext.getImageData(point.x * state.scale, point.y * state.scale, 1, 1).data;
    const color = getColorFromPixel(pixel)
    return state.colorHash.get(color);
  }

  eraseElementByPoint(point) {
    const id = this.getElementByPoint(point);
    if (id) {
      this.drawAndSend({
        id: id,
        tool: this.name,
        type: 'delete'
      })
    }
  }

  handleMouseDown(e, x, y) {
    this.eraseElementByPoint({ x: x, y: y });
  }

  handleMouseMove(e, x, y) {
    this.eraseElementByPoint({ x: x, y: y });
  }

  handleMouseUp() {}
}

export default Eraser;
