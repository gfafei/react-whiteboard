import Tool from '../tool';
import { uuid } from "../../utils";

let lastTime = 0;
class Tick extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Tick';
    this.cursor = 'url("tick.svg") 10 20, auto';
    this.icon = 'icon-tick';
    this.label = 'Tick';

    this.tickId = null;
  }

  update(point) {
    this.drawAndSend({
      tool: this.name,
      type: 'update',
      id: this.tickId,
      size: this.state.size,
      x: point.x,
      y: point.y
    })
  }

  handleMouseDown(e, x, y) {
    this.tickId = uuid();
    this.drawAndSend({
      tool: this.name,
      type: 'tick',
      id: this.tickId,
      x: x,
      y: y,
      color: '#4CBC3C',
      size: this.state.size
    })
  }

  handleMouseMove(e, x, y) {
    if (performance.now() - lastTime > 70) {
      this.update({ x, y });
      lastTime = performance.now();
    }
  }

  drawTick(tick) {
    const state = this.state;
    const stroke = (ctx, color) => {
      ctx.beginPath();
      let delta = tick.size * 3;
      ctx.moveTo(tick.x - delta, tick.y - delta);
      ctx.lineTo(tick.x, tick.y);
      delta = tick.size * 6;
      ctx.lineTo(tick.x + delta, tick.y - delta);
      ctx.lineWidth = tick.size * 1.5;
      ctx.strokeStyle = color || tick.color;
      ctx.lineCap = 'butt';
      ctx.stroke();
    }
    stroke(state.context);
    tick.colorKey = this.getColorKey();
    state.colorHash.set(tick.colorKey, tick.id);
    stroke(state.hitRegionContext, tick.colorKey);
  }

  draw(data) {
    const state = this.state;
    switch(data.type) {
      case 'tick':
        state.elements.set(data.id, data);
        this.drawTick(data);
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
export default Tick;
