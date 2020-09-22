import { clearCanvas, getRandomColor } from '../utils';
import clsx from 'classnames';
import React from 'react';

class Tool {
  constructor (state) {
    this.state = state;
    this.name = '';
    this.icon = '';
    this.label = '';
    this.cursor = 'default';
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
    const state = this.state;
    state.curTool = this.name;
    state.canvas.style.cursor = this.cursor;
    state.forceUpdate();
  }

  draw() {}

  renderNode() {
    const state = this.state;
    return (
      <div key={this.name}
           id={this.name}
           className={clsx('menu-item', { active: state.curTool === this.name })}
           onClick={this.handleClick.bind(this)}
      >
        <i className={clsx('icon', this.icon)}/>
        <span className="tool-name">{this.label}</span>
      </div>
    )
  }
}

export default Tool;
