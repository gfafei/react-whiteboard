import Tool from './tool';
import { uuid } from '../utils';

let lastSent = 0;
class Text extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Text';
    this.cursor = 'text';
    this.icon = 'icon-text';
    this.label = 'Text';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'textToolInput';
    input.setAttribute('autocomplete', 'off');
    this.$input = input;
    this.textChangeHandler = this.handleTextChange.bind(this);
    this.textBlurHandler = this.handleBlur.bind(this);
  }

  handleMouseDown(e)  {
    if (e.target === this.$input) return;
    this.stopEdit();
    this.prepareText(e.pageX, e.pageY)
    this.drawAndSend(this.curText);
    this.startEdit();
    e.preventDefault();
  }

  startEdit() {
    if (!this.$input.parentNode) {
      document.querySelector('.whiteboard').appendChild(this.$input);
    }
    this.$input.focus();
    this.$input.addEventListener('keyup', this.textChangeHandler);
    this.$input.addEventListener('blur', this.textBlurHandler);
  }

  stopEdit() {
    this.$input.removeEventListener('keyup', this.textChangeHandler);
    this.$input.removeEventListener('blur', this.textBlurHandler);
  }

  prepareText(x, y) {
    const pos = { x, y }
    const state = this.state;
    const size = state.size * 4 * state.scale;
    const rect = state.context.canvas.getBoundingClientRect();
    const INPUT_WIDTH = 240;
    if (pos.x + INPUT_WIDTH > rect.right) {
      pos.x = rect.right - INPUT_WIDTH;
    }
    if (pos.y + 20 < rect.top) {
      pos.y = rect.top - 20;
    }
    if (pos.y + 8 > rect.bottom) {
      pos.y = rect.bottom - 8;
    }
    this.$input.value = '';
    this.$input.style.fontSize = `${size}px`;
    this.$input.style.left = `${pos.x}px`;
    this.$input.style.top = `${pos.y - size + 2}px`;

    this.curText = {
      tool: 'Text',
      type: 'text',
      id: uuid(),
      color: state.color,
      size: state.size,
      x: (pos.x - rect.left) / state.scale,
      y: (pos.y - rect.top) / state.scale
    }
  }
  handleTextChange(e) {
    if (e.which === 13) {
      const rect = this.$input.getBoundingClientRect();
      const canvasRect = this.state.context.canvas.getBoundingClientRect();
      if (rect.bottom > canvasRect.bottom - 10) {
        return
      }
      this.stopEdit();
      this.prepareText(rect.left, rect.top + this.state.size * 8)
      this.drawAndSend(this.curText)
      this.startEdit()
    } else if (e.which === 27) {
      this.stopEdit();
      this.$input.style.top = '-10000px';
    } else {
      if (performance.now() - lastSent > 100) {
        console.log(this.$input.value)
        console.log(this.curText)
        if (this.$input.value !== this.curText.txt) {
          this.drawAndSend({
            tool: this.name,
            type: 'update',
            id: this.curText.id,
            txt: this.$input.value
          })
          this.curText.txt = this.$input.value;
          lastSent = performance.now();
        }
      } else {
        clearTimeout(this.curText.timeout);
        this.curText.timeout = setTimeout(this.textChangeHandler, 500, e);
      }
    }
  }

  handleBlur() {
    this.stopEdit();
    this.$input.style.top = '-10000px';
  }

  drawText(text) {
    const state = this.state;
    if (!text.txt) return;
    const stroke = (ctx, color) => {
      ctx.font = `${text.size * 4}px "Arial", "Helvetica", sans-serif`;
      ctx.fillStyle = color || text.color;
      ctx.fillText(text.txt, text.x, text.y);
    }
    stroke(state.context);
    text.colorKey = this.getColorKey();
    state.colorHash.set(text.colorKey, text.id);
    stroke(state.hitRegionContext, text.colorKey);
  }

  draw(data) {
    const state = this.state;
    switch(data.type) {
      case 'text':
        state.elements.set(data.id, data);
        this.drawText(data);
        break;
      case 'update':
        const element = state.elements.get(data.id);
        element.txt = data.txt;
        this.refresh();
        break;
      default:
        throw Error('unknown type');
    }
  }
}

export default Text;
