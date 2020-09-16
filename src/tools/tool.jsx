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

  handleMouseDown() {}

  handleMouseMove() {}

  handleMouseUp() {}

  draw() {}

  drawHitRegion() {}

}

export default Tool;
