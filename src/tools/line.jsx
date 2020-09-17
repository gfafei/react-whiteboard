import React from 'react';
import {
  uuid,
} from '../utils';
import Tool from './tool';
let lastTime = 0;

class Line extends Tool {
  constructor (state) {
    super(state)
    state.points = [];
    this.name = 'Pencil';
    this.cursor = 'url("pencil.svg") 5 20, auto';
    this.icon = 'icon-note';
    this.label = 'Pencil';
  }

  drawLine(line, startIdx = 0) {
    const start = line.points[startIdx];
    const stroke = (ctx, color) => {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y)
      for (let i = startIdx + 1; i < line.points.length; i++) {
        const point = line.points[i];
        ctx.lineTo(point.x, point.y);
      }
      ctx.lineWidth = line.size;
      ctx.strokeStyle = color || line.color;
      ctx.stroke();
    }
    stroke(this.state.context);
    if (startIdx === 0) {
      line.colorKey = this.getColorKey();
      this.state.elements.set(line.id, line);
      this.state.colorHash.set(line.colorKey, line.id);
    }
    stroke(this.state.hitRegionContext, line.colorKey);
  }

  draw(data) {
    switch(data.type) {
      case 'line':
        this.drawLine(data);
        break;
      case 'points':
        const line = this.state.elements.get(data.parent);
        if (!line) {
          throw Error(`line with id ${data.parent} does not exist`)
        }
        const startIdx = line.points.length - 1;
        line.points.push(...data.points);
        this.drawLine(line, startIdx);
        break;
      default:
        throw Error('unknown type')
    }
  }

  handleMouseDown(e) {
    const state = this.state;
    this.curLineId = uuid();
    const line = {
      tool: this.name,
      type: 'line',
      id: this.curLineId,
      color: state.color,
      colorKey: this.getColorKey(),
      size: state.size,
      points: [{ x: e.clientX, y: e.clientY }],
    }
    this.drawAndSend(line);
  }

  handleMouseMove(e) {
    this.state.points.push({ x: e.clientX, y: e.clientY });
    if (performance.now() - lastTime > 70) {
      const data = {
        tool: this.name,
        type: 'points',
        parent: this.curLineId,
        points: this.state.points
      }
      this.drawAndSend(data)
      this.state.points = [];
      lastTime = performance.now();
    }
  }

  handleMouseUp(e) {
    this.state.points.push({ x: e.clientX, y: e.clientY });
    const point = {
      tool: this.name,
      type: 'points',
      parent: this.curLineId,
      points: this.state.points
    }
    this.drawAndSend(point);
    this.state.points = [];
  }
}

export default Line;
