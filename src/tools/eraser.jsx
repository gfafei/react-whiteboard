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

  eraseElementByPoint(point) {
    const state = this.state;
    const pixel = state.hitRegionContext.getImageData(point.x, point.y, 1, 1).data;
    const color = getColorFromPixel(pixel)
    const id = state.colorHash.get(color);
    if (!id) return;
    state.elements.delete(id);
    state.colorHash.delete(color);
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

  handleMouseDown(e) {
    this.eraseElementByPoint({ x: e.clientX, y: e.clientY });
  }

  handleMouseMove(e) {
    this.eraseElementByPoint({ x: e.clientX, y: e.clientY });
  }

  handleMouseUp() {}
}

export default Eraser;
