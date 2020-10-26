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

  handleMouseDown(e, x, y) {
    if (e.target === this.$input) return;
    const state = this.state;
    const size = state.size * 4 * state.scale;
    const pos = { x, y };
    this.stopEdit();

    if (pos.x)
    this.$input.value = '';
    this.$input.style.fontSize = `${size}px`;
    this.$input.style.left = `${e.pageX}px`;
    this.$input.style.top = `${e.pageY - size + 2}px`;

    this.curText = {
      tool: 'Text',
      type: 'text',
      id: uuid(),
      color: state.color,
      size: state.size,
      x: x,
      y: y
    }
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

  handleTextChange(e) {
    if (e.which === 13) {

    } else if (e.which === 27) {
      this.stopEdit();
      this.$input.style.top = '-10000px';
    }
    if (performance.now() - lastSent > 100) {
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
