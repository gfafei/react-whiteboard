import {
  uuid,
} from '../utils';
import Tool from './tool';
let lastTime = 0;

class Pencil extends Tool {
  constructor (state) {
    super(state)
    this.points = [];
    this.name = 'Pencil';
    this.cursor = 'url("pencil.svg") 5 20, auto';
    this.icon = 'icon-note';
    this.label = 'Pencil';
  }

  drawLine(line, startIdx = 0) {
    const start = line.points[startIdx];
    const stroke = (ctx, color) => {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y)
      for (let i = startIdx + 1; i < line.points.length; i++) {
        const point = line.points[i];
        ctx.lineTo(point.x, point.y);
      }
      ctx.lineWidth = line.size;
      ctx.strokeStyle = color || line.color;
      ctx.stroke();
    }
    stroke(this.state.context);
    if (startIdx === 0) {
      line.colorKey = this.getColorKey();
      this.state.elements.set(line.id, line);
      this.state.colorHash.set(line.colorKey, line.id);
    }
    stroke(this.state.hitRegionContext, line.colorKey);
  }

  updateLine() {
    const data = {
      tool: this.name,
      type: 'points',
      parent: this.curLineId,
      points: this.points
    }
    this.drawAndSend(data)
    this.points = [];
  }

  draw(data) {
    switch(data.type) {
      case 'line':
        this.drawLine(data);
        break;
      case 'points':
        const line = this.state.elements.get(data.parent);
        if (!line) {
          throw Error(`line with id ${data.parent} does not exist`)
        }
        const startIdx = line.points.length - 1;
        line.points.push(...data.points);
        this.drawLine(line, startIdx);
        break;
      default:
        throw Error('unknown type')
    }
  }

  handleMouseDown(e) {
    const state = this.state;
    this.curLineId = uuid();
    const line = {
      tool: this.name,
      type: 'line',
      id: this.curLineId,
      color: state.color,
      colorKey: this.getColorKey(),
      size: state.size,
      points: [{ x: e.clientX, y: e.clientY }],
    }
    this.drawAndSend(line);
  }

  handleMouseMove(e) {
    this.points.push({ x: e.clientX, y: e.clientY });
    if (performance.now() - lastTime > 70) {
      this.updateLine();
      lastTime = performance.now();
    }
  }

  handleMouseUp(e) {
    this.points.push({ x: e.clientX, y: e.clientY });
    this.updateLine();
  }
}

export default Pencil;
