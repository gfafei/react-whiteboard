import Tool from '../tool';
import { uuid } from "../../utils";

let lastTime = 0;

class Line extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Line';
    this.cursor = 'crosshair';
    this.icon = 'icon-line';
    this.label = 'Line';

    this.lineId = null;
  }

  update(point) {
    this.drawAndSend({
      tool: this.name,
      type: 'update',
      id: this.lineId,
      color: this.state.color,
      size: this.state.size,
      x2: point.x,
      y2: point.y
    })
  }

  handleMouseDown(e, x, y) {
    this.lineId = uuid();
    this.drawAndSend({
      tool: this.name,
      type: 'straight',
      id: this.lineId,
      x1: x,
      y1: y,
      color: this.state.color,
      size: this.state.size
    });
  }

  handleMouseMove(e, x, y) {
    if (performance.now() - lastTime > 70) {
      this.update({ x, y });
      lastTime = performance.now();
    }
  }

  handleMouseUp(e, x, y) {
    this.update({ x, y });
    this.lineId = null;
  }

  drawLine(line) {
    const state = this.state;
    const stroke = (ctx, color) => {
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.lineCap = 'butt';
      ctx.lineWidth = line.size;
      ctx.strokeStyle = color || line.color;
      ctx.stroke();
    }
    stroke(state.context);
    line.colorKey = this.getColorKey();
    state.colorHash.set(line.colorKey, line.id);
    stroke(state.hitRegionContext, line.colorKey);
  }

  draw(data) {
    const state = this.state;
    switch(data.type) {
      case 'straight':
        state.elements.set(data.id, data);
        if (data.hasOwnProperty('x2')) {
          this.drawLine(data);
        }
        break;
      case 'update':
        const element = state.elements.get(data.id);
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

export default Line;
