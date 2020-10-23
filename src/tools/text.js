import Tool from './tool';
import { uuid } from '../utils';

class Text extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Text';
    this.cursor = 'text';
    this.icon = 'icon-text';
    this.label = 'Text';
  }
}

export default Text;
