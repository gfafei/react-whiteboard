import Tool from "../tool";
import { uuid } from "../../utils";

let lastTime = 0;
class Heart extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Heart';
    this.cursor = 'url("heart.svg"), auto';
    this.icon = 'icon-heart';
    this.label = 'Heart';

    this.heartId = null;
  }

  update(point) {
    this.drawAndSend({
      tool: this.name,
      type: 'update',
      id: this.heartId,
      x: point.x,
      y: point.y
    })
  }

  handleMouseDown(e, x, y) {
    this.heartId = uuid();
    this.drawAndSend({
      tool: this.name,
      type: 'heart',
      id: this.heartId,
      x: x,
      y: y,
      color: '#FD171D',
      size: this.state.size
    })
  }

  handleMouseMove(e, x, y) {
    if (performance.now() - lastTime > 70) {
      this.update({ x, y });
      lastTime = performance.now();
    }
  }

  drawHeart(heart) {
    const state = this.state;
    const x = heart.x + 13;
    const y = heart.y + 13;
    const stroke = (ctx, color) => {
      const step = 0.1;
      ctx.beginPath();
      ctx.fillStyle = color || heart.color;
      ctx.moveTo(x, y + 5);
      for(let i = step; i < 2 * Math.PI; i += step) {
        ctx.lineTo(
          x + 16 * Math.pow(Math.sin(i), 3),
          y - 13 * Math.cos(i) + 5 * Math.cos(2 * i) + 2 * Math.cos(3 * i) + Math.cos(4 * i)
        )
      }
      ctx.closePath();
      ctx.fill();
    }
    stroke(state.context);
    heart.colorKey = this.getColorKey();
    state.colorHash.set(heart.colorKey, heart.id);
    stroke(state.hitRegionContext, heart.colorKey);
  }

  draw(data) {
    const state = this.state;
    switch (data.type) {
      case 'heart':
        state.elements.set(data.id, data);
        this.drawHeart(data);
        break;
      case 'update':
        const element = state.elements.get(data.id);
        element.x = data.x;
        element.y = data.y;
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

export default Heart;
