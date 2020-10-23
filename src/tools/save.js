import Tool from './tool';

class Save extends Tool {
  constructor(state) {
    super(state);
    this.name = 'Save';
    this.icon = 'icon-save';
    this.label = 'Save';
  }
}

export default Save;
