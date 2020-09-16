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
    state.eraser = {
      mousePressed: false
    }
    state.colorHash = {};
    this.cursor = 'url("eraser.svg") 5 20, auto';
    this.icon = 'icon-eraser';
    this.label = 'Eraser';
  }

  handleMouseDown(e) {
    const state = this.state;
    const pos = {
      x: e.clientX,
      y: e.clientY
    }
    state.eraser.mousePressed = true;
    const pixel = state.hitRegionContext?.getImageData(pos.x, pos.y, 1, 1).data;
    const color = getColorFromPixel(pixel)
    const id = state.colorHash[color];
    if (!id) return;
    state.elements.delete(id);
    state.colorHash = {};
    clearCanvas(state.mainContext)
    state.elements.forEach(element => {
      const tool = state.toolDic[element.type]
      if (!tool) {
        throw Error(`tool ${element.type} does not exist`)
      }
      tool.draw(element);
    })
  }

  handleMouseMove(e) {
    const state = this.state;
    if (!state.eraser.mousePressed) return;
    const pos = {
      x: e.clientX,
      y: e.clientY
    }
    const pixel = state.hitRegionContext?.getImageData(pos.x, pos.y, 1, 1).data;
    const color = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
    const id = state.colorHash[color];
    if (!id) return;
    state.elements.delete(id);
    clearCanvas(state.mainContext);
    clearCanvas(state.hitRegionContext);
    state.colorHash = {};
    state.elements.forEach(element => {
      const tool = state.toolDic[element.type]
      if (!tool) {
        throw Error(`tool ${element.type} does not exist`)
      }
      tool.draw(element);
      tool.drawHitRegion(element);
    })
  }

  handleMouseUp() {
    const state = this.state;
    state.eraser.mousePressed = false;
  }
}

export default Eraser;
