import Tool from '../tool';
import { uuid } from "../../utils";

let lastTime = 0;
class Cross extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Cross';
    this.cursor = 'url("cross.svg"), auto';
    this.icon = 'icon-cross';
    this.label = 'Cross';

    this.crossId = null;
  }

  update(point) {
    this.drawAndSend({
      tool: this.name,
      type: 'update',
      id: this.crossId,
      x: point.x,
      y: point.y
    })
  }

  handleMouseDown(e, x, y) {
    this.crossId = uuid();
    this.drawAndSend({
      tool: this.name,
      type: 'cross',
      id: this.crossId,
      x: x,
      y: y,
      color: '#F35630',
      size: this.state.size
    })
  }

  handleMouseMove(e, x, y) {
    if (performance.now() - lastTime > 70) {
      this.update({ x, y });
      lastTime = performance.now();
    }
  }

  drawCross(cross) {
    const state = this.state;
    const stroke = (ctx, color) => {
      ctx.beginPath();
      const x = cross.x + 14;
      const y = cross.y + 15;
      ctx.moveTo(x - 4 * cross.size, y - 4 * cross.size);
      ctx.lineTo(x + 4 * cross.size, y + 4 * cross.size);
      ctx.moveTo(x + 4 * cross.size, y - 4 * cross.size);
      ctx.lineTo(x - 4 * cross.size, y + 4 * cross.size);
      ctx.lineWidth = cross.size * 1.5;
      ctx.strokeStyle = color || cross.color;
      ctx.lineCap = 'butt';
      ctx.stroke();
    }
    stroke(state.context);
    cross.colorKey = this.getColorKey();
    state.colorHash.set(cross.colorKey, cross.id);
    stroke(state.hitRegionContext, cross.colorKey);
  }

  draw(data) {
    const state = this.state;
    switch (data.type) {
      case 'cross':
        state.elements.set(data.id, data);
        this.drawCross(data);
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

export default Cross;
