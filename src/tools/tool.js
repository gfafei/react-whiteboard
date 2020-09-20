import { clearCanvas, getRandomColor } from '../utils'
class Tool {
  constructor (state) {
    this.state = state;
    this.name = '';
  }

  getColorKey() {
    const state = this.state;
    while (true) {
      const colorKey = getRandomColor();
      if (!state.colorHash[colorKey]) {
        return colorKey;
      }
    }
  }

  send(data) {
    const message = {
      board: this.state.boardName,
      data: data
    }
    this.state.socket.emit('broadcast', message);
  }

  drawAndSend(data) {
    const tool = this.state.toolDic[data.tool];
    tool.draw(data);
    this.send(data);
  }

  refresh() {
    const state = this.state;
    clearCanvas(state.context);
    clearCanvas(state.hitRegionContext);
    state.elements.forEach(element => {
      const tool = state.toolDic[element.tool];
      if (!tool) {
        throw Error(`tool ${element.tool} does not exist`)
      }
      tool.draw(element);
    })
  }

  handleMouseDown() {}

  handleMouseMove() {}

  handleMouseUp() {}

  handleClick() {
    this.state.setTool(this.name)
  }

  draw() {}

}

export default Tool;