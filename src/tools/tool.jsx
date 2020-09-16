import { getRandomColor } from '../utils'

class Tool {
  constructor (state) {
    this.state = state;
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

  handleMouseDown() {}

  handleMouseMove() {}

  handleMouseUp() {}

  draw() {}

  drawHitRegion() {}

}

export default Tool;
