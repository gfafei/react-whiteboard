import React from 'react';
import { clearCanvas } from '../utils'
import Tool from './tool'

const getColorFromPixel = (pixel) => {
  return `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`
}
class Eraser extends Tool {
  constructor(state) {
    super(state);
    this.state = state;
    this.name = 'Eraser';
    state.colorHash = new Map();
    this.cursor = 'url("eraser.svg") 5 20, auto';
    this.icon = 'icon-eraser';
    this.label = 'Eraser';
  }

  draw(data) {
    if (data.type !== 'delete') {
      console.error('unknown type ' + data.type);
      return;
    }
    const id = data.id;
    const state = this.state;
    const element = this.state.elements.get(id)
    state.colorHash.delete((element.colorKey));
    state.elements.delete(id);
    clearCanvas(state.context);
    clearCanvas(state.hitRegionContext);
    state.elements.forEach(element => {
      const tool = state.toolDic[element.tool]
      if (!tool) {
        throw Error(`tool ${element.tool} does not exist`)
      }
      tool.draw(element);
    })
  }

  getElementByPoint(point) {
    const state = this.state;
    const pixel = state.hitRegionContext.getImageData(point.x, point.y, 1, 1).data;
    const color = getColorFromPixel(pixel)
    return state.colorHash.get(color);
  }

  eraseElementByPoint(point) {
    const id = this.getElementByPoint(point);
    if (id) {
      this.drawAndSend({
        id: id,
        tool: this.name,
        type: 'delete'
      })
    }
  }

  handleMouseDown(e) {
    this.eraseElementByPoint({ x: e.clientX, y: e.clientY });
  }

  handleMouseMove(e) {
    this.eraseElementByPoint({ x: e.clientX, y: e.clientY });
  }

  handleMouseUp() {}
}

export default Eraser;
