import Tool from '../tool';
import { uuid } from "../../utils";

let lastTime = 0;
class Circle extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Circle';
    this.cursor = 'crosshair';
    this.icon = 'icon-circle';
    this.label = 'Circle';

    this.circleId = null;
  }

  update(point) {
    this.drawAndSend({
      tool: this.name,
      type: 'update',
      id: this.circleId,
      color: this.state.color,
      size: this.state.size,
      x2: point.x,
      y2: point.y
    })
  }

  handleMouseDown(e, x, y) {
    this.circleId = uuid();
    this.drawAndSend({
      tool: this.name,
      type: 'circle',
      id: this.circleId,
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
    this.circleId = null;
  }

  drawCircle(circle) {
    const state = this.state;
    const a = Math.abs(circle.x1 - circle.x2) / 2;
    const b = Math.abs(circle.y1 - circle.y2) / 2;
    const x = (circle.x1 + circle.x2) / 2;
    const y = (circle.y1 + circle.y2) / 2;

    const stroke = (ctx, color) => {
      const step = 10 / Math.max(a, b);
      ctx.beginPath();
      ctx.lineWidth = circle.size;
      ctx.strokeStyle = color || circle.color;
      ctx.moveTo(x + a, y);
      for (let i = step; i < 2 * Math.PI; i += step) {
        ctx.lineTo(x + a * Math.cos(i), y + b * Math.sin(i));
      }
      ctx.closePath();
      ctx.stroke();
    }
    stroke(state.context);
    circle.colorKey = this.getColorKey();
    state.colorHash.set(circle.colorKey, circle.id);
    stroke(state.hitRegionContext, circle.colorKey);
  }

  draw(data) {
    const state = this.state;
    switch (data.type) {
      case 'circle':
        state.elements.set(data.id, data);
        if (data.hasOwnProperty('x2')) {
          this.drawCircle(data);
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

export default Circle;
