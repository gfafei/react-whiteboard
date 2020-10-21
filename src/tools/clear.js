import Tool from './tool';

class Clear extends Tool {
  constructor (state) {
    super(state);
    this.name = 'Clear';
    this.icon = 'icon-delete';
    this.label = 'Clear';
  }

  draw(data) {
    if (data.type !== 'clear') {
      throw Error('unknown type')
    }
    this.state.elements.clear();
    this.refresh();
  }

  handleClick() {
    const state = this.state;
    this.drawAndSend({
      type: 'clear',
      tool: this.name,
      ids: Array.from(state.elements.keys())
    })
  }
}

export default Clear;
