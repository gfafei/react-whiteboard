import Tool from '../tool';
import { uuid } from "../../utils";

let lastTime = 0;
class Arrow extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Arrow';
    this.cursor = 'crosshair';
    this.icon = 'icon-arrow';
    this.label = 'Arrow';

    this.arrowId = null;
  }

  update(point) {
    this.drawAndSend({
      tool: this.name,
      type: 'update',
      id: this.arrowId,
      color: this.state.color,
      size: this.state.size,
      x2: point.x,
      y2: point.y
    })
  }

  handleMouseDown(e, x, y) {
    this.arrowId = uuid();
    this.drawAndSend({
      tool: this.name,
      type: 'arrow',
      id: this.arrowId,
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
    this.arrowId = null;
  }

  drawArrow(line) {
    const state = this.state;
    let headlen = line.size * 3;//箭头线的长度
    let theta = 45;//箭头角度
    let arrowX, arrowY;//箭头线终点坐标
    let angle = Math.atan2(line.y1 - line.y2, line.x1 - line.x2) * 180 / Math.PI;
    let angle1 = (angle + theta) * Math.PI / 180;
    let angle2 = (angle - theta) * Math.PI / 180;
    let topX = headlen * Math.cos(angle1);
    let topY = headlen * Math.sin(angle1);
    let botX = headlen * Math.cos(angle2);
    let botY = headlen * Math.sin(angle2);
    const stroke = (ctx, color) => {
      let lineEndX = line.x2;
      let lineEndY = line.y2;
      const halfHeadLen = headlen / 2;
      let length = Math.sqrt(Math.pow(line.x1 - line.x2, 2) + Math.pow(line.y1 - line.y2, 2));
      if (length > halfHeadLen) {
        lineEndX = (length - halfHeadLen) * (line.x2 - line.x1) / length + line.x1;
        lineEndY = (length - halfHeadLen) * (line.y2 - line.y1) / length + line.y1;
      }
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(lineEndX, lineEndY);
      ctx.lineWidth = line.size;
      ctx.strokeStyle = color || line.color;
      ctx.lineCap = 'butt';
      ctx.stroke();

      ctx.beginPath();
      arrowX = line.x2 + topX;
      arrowY = line.y2 + topY;
      //画上边箭头线
      ctx.moveTo(arrowX, arrowY);
      ctx.lineTo(line.x2, line.y2);
      arrowX = line.x2 + botX;
      arrowY = line.y2 + botY;
      //画下边箭头线
      ctx.lineTo(arrowX, arrowY);
      ctx.closePath();
      ctx.fillStyle = color || line.color;
      ctx.fill();
    }
    stroke(state.context);
    line.colorKey = this.getColorKey();
    state.colorHash.set(line.colorKey, line.id);
    stroke(state.hitRegionContext, line.colorKey);
  }

  draw(data) {
    const state = this.state;
    switch(data.type) {
      case 'arrow':
        state.elements.set(data.id, data);
        if (data.hasOwnProperty('x2')) {
          this.drawArrow(data);
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

export default Arrow;
