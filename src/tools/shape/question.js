import Tool from '../tool';
import { uuid } from "../../utils";

let lastTime = 0;
class Question extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Question';
    this.cursor = 'url("question.svg"), auto';
    this.icon = 'icon-question';
    this.label = 'Question';

    this.questionId = null;
  }

  update(point) {
    this.drawAndSend({
      tool: this.name,
      type: 'update',
      id: this.questionId,
      x: point.x,
      y: point.y
    });
  }

  handleMouseDown(e, x, y) {
    this.questionId = uuid();
    this.drawAndSend({
      tool: this.name,
      type: 'question',
      id: this.questionId,
      x: x,
      y: y,
      color: '#408AC6',
      size: this.state.size
    })
  }

  handleMouseMove(e, x, y) {
    if (performance.now() - lastTime > 70) {
      this.update({ x, y });
      lastTime = performance.now();
    }
  }

  drawQuestion(question) {
    const state = this.state;
    const stroke = (ctx, color) => {
      const x = question.x + 14;
      const y = question.y + 10;
      ctx.beginPath();
      ctx.arc(x, y,  2 * question.size, Math.PI,  Math.PI * 2);
      ctx.moveTo(x + 2 * question.size, y - 1);
      ctx.bezierCurveTo(
        x + 1.6 * question.size, y + 2.4 * question.size,
        x, y + question.size,
        x, y + 3.5 * question.size
      )
      ctx.lineWidth = question.size;
      ctx.lineCap = 'butt';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color || question.color;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y + 4.5 * question.size, question.size * .6, 0, Math.PI * 2);
      ctx.fillStyle = color || question.color;
      ctx.fill();
    }
    stroke(state.context);
    question.colorKey = this.getColorKey();
    state.colorHash.set(question.colorKey, question.id);
    stroke(state.hitRegionContext, question.colorKey);
  }

  draw(data) {
    const state = this.state;
    switch (data.type) {
      case 'question':
        state.elements.set(data.id, data);
        this.drawQuestion(data);
        break;
      case 'update':
        const element = state.elements.get(data.id);
        element.x = data.x;
        element.y = data.y;
        this.refresh();
        break;
      default:
        throw Error('unknown type');
    }
  }

  renderNode() {
    return null;
  }
}

export default Question;
