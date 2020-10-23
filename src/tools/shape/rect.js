import Tool from '../tool';
import { uuid } from '../../utils';

let lastTime = 0;
class Rect extends Tool {
  constructor (state) {
    super(state);
    this.name = 'Rect';
    this.cursor = 'crosshair';
    this.icon = 'icon-rect';
    this.label = 'Rect';
  }

  update(point) {
    this.drawAndSend({
      tool: this.name,
      type: 'update',
      id: this.rectId,
      color: this.state.color,
      size: this.state.size,
      x2: point.x,
      y2: point.y
    })
  }

  drawRect(rect) {
    const state = this.state;
    const x1 = Math.min(rect.x1, rect.x2);
    const y1 = Math.min(rect.y1, rect.y2);
    const x2 = Math.max(rect.x1, rect.x2);
    const y2 = Math.max(rect.y1, rect.y2);
    const stroke = (ctx, color) => {
      ctx.lineWidth = rect.size;
      ctx.strokeStyle = color || rect.color;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }
    stroke(state.context);
    rect.colorKey = this.getColorKey();
    state.colorHash.set(rect.colorKey, rect.id);
    stroke(state.hitRegionContext, rect.colorKey);
  }

  handleMouseDown (e, x, y) {
    this.rectId = uuid();
    this.drawAndSend({
      tool: this.name,
      type: 'rect',
      id: this.rectId,
      x1: x,
      y1: y,
      color: this.state.color,
      size: this.state.size
    });
  }
  handleMouseMove(e, x, y) {
    if (performance.now() - lastTime > 70) {
      this.update({ x: x, y: y });
      lastTime = performance.now();
    }
  }

  handleMouseUp (e, x, y) {
    this.update({ x: x, y: y });
    this.rectId = null;
  }

  draw(data) {
    const state = this.state;
    switch (data.type) {
      case 'rect':
        state.elements.set(data.id, data);
        if (data.hasOwnProperty('x2')) {
          this.drawRect(data);
        }
        break;
      case 'update':
        const element = state.elements.get(data.id)
        element.x2 = data.x2;
        element.y2 = data.y2;
        this.refresh();
        break;
      default:
        throw Error('unknown type')
    }
  }

  renderNode() {
    return null;
  }
}

export default Rect;
